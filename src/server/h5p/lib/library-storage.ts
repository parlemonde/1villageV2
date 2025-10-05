import type {
    IAdditionalLibraryMetadata,
    IInstalledLibrary,
    ILibraryMetadata,
    ILibraryName,
    ILibraryStorage,
    IFileStats,
} from '@lumieducation/h5p-server';
import { InstalledLibrary, streamToString, LibraryName, H5pError } from '@lumieducation/h5p-server';
import { deleteDynamoDBItem, getDynamoDBItem, scanDynamoDB, setDynamoDBItem } from '@server/aws/dynamodb';
import { deleteFile, getFile, getFileData, listFiles, uploadFile } from '@server/files/file-upload';
import * as path from 'path';
import { Readable } from 'stream';

import { validateFilename } from './sanitize-filename';

const LIBRARY_PREFIX = `H5P_libraries_`;

type LibraryDep = {
    dynamicDependencies: ILibraryName[];
    editorDependencies: ILibraryName[];
    machineName: string;
    majorVersion: number;
    minorVersion: number;
    preloadedDependencies: ILibraryName[];
    ubername: string;
};
type AdditionalMetadata = Record<string, unknown>;
type ExtendedLibraryMetadata = ILibraryMetadata & { additionalMetadata?: AdditionalMetadata };

const getKey = (library: ILibraryName, filename: string): string => {
    const key = `h5p/libraries/${LibraryName.toUberName(library)}/${filename}`;
    if (key.length > 1024) {
        console.error(
            `The S3 key for "${filename}" in library object for library ${LibraryName.toUberName(library)} is ${
                key.length
            } bytes long, but only 1024 are allowed.`,
        );
        throw new H5pError('content-storage:filename-too-long', { filename }, 400);
    }
    return key;
};

export class LibraryStorage implements ILibraryStorage {
    private async getMetadata(library: ILibraryName): Promise<ILibraryMetadata> {
        if (!library) {
            throw new Error('You must pass in a library name to getLibrary.');
        }
        const result = await getDynamoDBItem<ExtendedLibraryMetadata>(`${LIBRARY_PREFIX}${LibraryName.toUberName(library)}`);
        if (!result) {
            throw new H5pError('storage:error-getting-library-metadata', { ubername: LibraryName.toUberName(library) });
        }
        const { additionalMetadata, ...metadata } = result;
        return metadata;
    }

    public async addFile(library: ILibraryName, filename: string, readStream: Readable): Promise<boolean> {
        validateFilename(filename);
        try {
            await uploadFile(getKey(library, filename), readStream);
        } catch (error) {
            console.error(`Error while uploading file "${filename}" to S3 storage: ${error instanceof Error ? error.message : ''}`);
            throw new H5pError(`library-storage:s3-upload-error`, { ubername: LibraryName.toUberName(library), filename }, 500);
        }
        return true;
    }

    public async addLibrary(libraryData: ILibraryMetadata, restricted: boolean): Promise<IInstalledLibrary> {
        const ubername = LibraryName.toUberName(libraryData);
        try {
            await setDynamoDBItem<ExtendedLibraryMetadata>(`${LIBRARY_PREFIX}${ubername}`, { ...libraryData, additionalMetadata: { restricted } });
        } catch (error) {
            console.error(error);
            throw new H5pError('library-storage:error-adding-metadata');
        }
        return InstalledLibrary.fromMetadata({ ...libraryData, restricted });
    }

    public async clearFiles(library: ILibraryName): Promise<void> {
        if (!(await this.isInstalled(library))) {
            throw new H5pError('library-storage:clear-library-not-found', {
                ubername: LibraryName.toUberName(library),
            });
        }
        const filesToDelete = await this.listFiles(library, {
            withMetadata: false,
        });
        // S3 batch deletes only work with 1000 files at a time, so we
        // might have to do this in several requests.
        try {
            while (filesToDelete.length > 0) {
                const next1000Files = filesToDelete.splice(0, 1000);
                if (next1000Files.length > 0) {
                    await Promise.all(next1000Files.map((f) => deleteFile(getKey(library, f))));
                }
            }
        } catch (error) {
            console.error(`There was an error while clearing the files: ${error instanceof Error ? error.message : ''}`);
            throw new H5pError('library-storage:deleting-files-error');
        }
    }

    public async deleteLibrary(library: ILibraryName): Promise<void> {
        if (!(await this.isInstalled(library))) {
            throw new H5pError('library-storage:library-not-found');
        }
        await this.clearFiles(library);

        try {
            await deleteDynamoDBItem(`${LIBRARY_PREFIX}${LibraryName.toUberName(library)}`);
        } catch (error) {
            console.error(error);
            throw new H5pError('library-storage:error-deleting', {
                ubername: LibraryName.toUberName(library),
            });
        }
    }

    public async fileExists(library: ILibraryName, filename: string): Promise<boolean> {
        validateFilename(filename);
        try {
            const result = await getFileData(getKey(library, filename));
            return result !== null && result.ContentLength > 0;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    public async getAllDependentsCount(): Promise<{ [ubername: string]: number }> {
        let libraryDeps: LibraryDep[] = [];
        try {
            const allLibraries = await scanDynamoDB<ExtendedLibraryMetadata>({
                filterExpression: 'begins_with(#key, :prefix)',
                expressionAttributeNames: { '#key': 'key' },
                expressionAttributeValues: { ':prefix': LIBRARY_PREFIX },
            });
            libraryDeps = allLibraries.map<LibraryDep>((row) => ({
                dynamicDependencies: row.value.dynamicDependencies || [],
                editorDependencies: row.value.editorDependencies || [],
                machineName: row.value.machineName,
                majorVersion: row.value.majorVersion,
                minorVersion: row.value.minorVersion,
                preloadedDependencies: row.value.preloadedDependencies || [],
                ubername: row.key.slice(LIBRARY_PREFIX.length),
            }));
        } catch (error) {
            console.error(error);
            throw new H5pError('library-storage:error-getting-dependents');
        }

        // the dependency map allows faster access to libraries by ubername
        const librariesDepsMap: {
            [ubername: string]: LibraryDep;
        } = libraryDeps.reduce<{
            [ubername: string]: LibraryDep;
        }>((prev, curr) => {
            prev[curr.ubername] = curr;
            return prev;
        }, {});

        // Remove circular dependencies caused by editor dependencies in
        // content types like H5P.InteractiveVideo.
        for (const lib of libraryDeps) {
            for (const dependency of lib.editorDependencies ?? []) {
                const ubername = LibraryName.toUberName(dependency);
                const index = librariesDepsMap[ubername].preloadedDependencies?.findIndex((ln) => LibraryName.equal(ln, lib));
                if (index >= 0) {
                    librariesDepsMap[ubername].preloadedDependencies.splice(index, 1);
                }
            }
        }

        // Count dependencies
        const dependencies: Record<string, number> = {};
        for (const lib of libraryDeps) {
            for (const dependency of (lib.preloadedDependencies ?? []).concat(lib.editorDependencies ?? []).concat(lib.dynamicDependencies ?? [])) {
                const ubername = LibraryName.toUberName(dependency);
                dependencies[ubername] = (dependencies[ubername] ?? 0) + 1;
            }
        }

        return dependencies;
    }

    public async getDependentsCount(library: ILibraryName): Promise<number> {
        try {
            const results = await scanDynamoDB<ExtendedLibraryMetadata>({
                filterExpression: 'begins_with(#key, :prefix )AND #value.preloadedDependencies = :library',
                expressionAttributeNames: { '#key': 'key', '#value': 'value' },
                expressionAttributeValues: { ':prefix': LIBRARY_PREFIX, ':library': library },
            });
            return results.length;
        } catch (error) {
            console.error(error);
            throw new H5pError('library-storage:error-getting-dependents', {
                ubername: LibraryName.toUberName(library),
            });
        }
    }

    public async getFileAsJson(library: ILibraryName, file: string): Promise<unknown> {
        const str = await this.getFileAsString(library, file);
        return JSON.parse(str);
    }

    public async getFileAsString(library: ILibraryName, file: string): Promise<string> {
        const stream: Readable = await this.getFileStream(library, file);
        return streamToString(stream);
    }

    public async getFileStats(library: ILibraryName, file: string): Promise<IFileStats> {
        validateFilename(file);

        // As the metadata is not S3, we need to get it from MongoDB.
        if (file === 'library.json') {
            const metadata = JSON.stringify(await this.getMetadata(library));
            return { size: metadata.length, birthtime: new Date() };
        }

        const metadata = await getFileData(getKey(library, file));
        if (!metadata) {
            throw new H5pError('content-file-missing', { ubername: LibraryName.toUberName(library), filename: file }, 404);
        }
        return { size: metadata.ContentLength, birthtime: metadata.LastModified };
    }

    public async getFileStream(library: ILibraryName, filename: string): Promise<Readable> {
        validateFilename(filename);

        // As the metadata is not S3, we need to get it from dynamoDB.
        if (filename === 'library.json') {
            const metadata = JSON.stringify(await this.getMetadata(library));
            return Readable.from([metadata]);
        }

        const fileStream = await getFile(getKey(library, filename));
        if (!fileStream) {
            throw new H5pError('content-file-missing', { ubername: LibraryName.toUberName(library), filename }, 404);
        }
        return fileStream;
    }

    public async getInstalledLibraryNames(machineName?: string | undefined): Promise<ILibraryName[]> {
        try {
            let results: { key: string; value: ExtendedLibraryMetadata }[] = [];
            if (machineName) {
                results = await scanDynamoDB<ExtendedLibraryMetadata>({
                    filterExpression: 'begins_with(#key, :prefix )AND #value.machineName = :machineName',
                    expressionAttributeNames: { '#key': 'key', '#value': 'value' },
                    expressionAttributeValues: { ':prefix': LIBRARY_PREFIX, ':machineName': machineName },
                });
            } else {
                results = await scanDynamoDB<ExtendedLibraryMetadata>({
                    filterExpression: 'begins_with(#key, :prefix)',
                    expressionAttributeNames: { '#key': 'key' },
                    expressionAttributeValues: { ':prefix': LIBRARY_PREFIX },
                });
            }
            return results.map((d) => LibraryName.fromUberName(d.key.slice(LIBRARY_PREFIX.length)));
        } catch (error) {
            console.error(error);
            throw new H5pError('library-storage:error-getting-libraries');
        }
    }

    public async getLanguages(library: ILibraryName): Promise<string[]> {
        const prefix = getKey(library, 'language');
        try {
            const files: string[] = [];
            let result: { files: string[]; nextContinuationToken?: string } | undefined;
            do {
                result = await listFiles(prefix, result?.nextContinuationToken);
                files.push(...result.files.map((f) => f.slice(prefix.length)));
            } while (result.nextContinuationToken);
            return files.filter((file) => path.extname(file) === '.json').map((file) => path.basename(file, '.json'));
        } catch {
            console.error(
                `There was an error while getting list of files from S3. This might not be a problem if no languages were added to the library.`,
            );
            return [];
        }
    }

    public async getLibrary(library: ILibraryName): Promise<IInstalledLibrary> {
        if (!library) {
            throw new Error('You must pass in a library name to getLibrary.');
        }
        const result = await getDynamoDBItem<ExtendedLibraryMetadata>(`${LIBRARY_PREFIX}${LibraryName.toUberName(library)}`);
        if (!result) {
            throw new H5pError('library-storage:error-getting-library-metadata', { ubername: LibraryName.toUberName(library) });
        }
        const { additionalMetadata, ...metadata } = result;
        return InstalledLibrary.fromMetadata(metadata);
    }

    public async isInstalled(library: ILibraryName): Promise<boolean> {
        try {
            return (await getDynamoDBItem<ExtendedLibraryMetadata>(`${LIBRARY_PREFIX}${LibraryName.toUberName(library)}`)) !== undefined;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    public async listAddons(): Promise<ILibraryMetadata[]> {
        try {
            const results = await scanDynamoDB<ExtendedLibraryMetadata>({
                filterExpression: 'begins_with(#key, :prefix )AND attribute_exists(#value.addTo)',
                expressionAttributeNames: { '#key': 'key', '#value': 'value' },
                expressionAttributeValues: { ':prefix': LIBRARY_PREFIX },
            });
            return results.map((row) => row.value).map(({ additionalMetadata, ...metadata }) => metadata);
        } catch (error) {
            console.error(error);
            throw new H5pError('library-storage:error-getting-addons');
        }
    }

    public async listFiles(library: ILibraryName, options?: { withMetadata?: boolean }): Promise<string[]> {
        const prefix = getKey(library, '');
        try {
            const files: string[] = [];
            let result: { files: string[]; nextContinuationToken?: string } | undefined;
            do {
                result = await listFiles(prefix, result?.nextContinuationToken);
                files.push(...result.files.map((f) => f.slice(prefix.length)));
            } while (result.nextContinuationToken);
            if (options?.withMetadata) {
                files.push('library.json');
            }
            return files;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    public async updateAdditionalMetadata(library: ILibraryName, additionalMetadata: Partial<IAdditionalLibraryMetadata>): Promise<boolean> {
        if (!library) {
            throw new Error('You must specify a library name when calling updateAdditionalMetadata.');
        }
        try {
            const libraryMetadata = await this.getMetadata(library);
            await setDynamoDBItem<ExtendedLibraryMetadata>(`${LIBRARY_PREFIX}${LibraryName.toUberName(library)}`, {
                ...libraryMetadata,
                additionalMetadata,
            });
        } catch (error) {
            console.error(error);
            throw new H5pError('library-storage:update-additional-metadata-error', {
                ubername: LibraryName.toUberName(library),
            });
        }
        return true;
    }

    public async updateLibrary(libraryMetadata: ILibraryMetadata): Promise<IInstalledLibrary> {
        const ubername = LibraryName.toUberName(libraryMetadata);

        try {
            const additionalMetadata = (await getDynamoDBItem<ExtendedLibraryMetadata>(`${LIBRARY_PREFIX}${ubername}`))?.additionalMetadata || {};
            await setDynamoDBItem<ExtendedLibraryMetadata>(`${LIBRARY_PREFIX}${ubername}`, { ...libraryMetadata, additionalMetadata });
            return InstalledLibrary.fromMetadata({
                ...libraryMetadata,
                ...additionalMetadata,
            });
        } catch (error) {
            console.error(error);
            throw new H5pError('library-storage:update-error', {
                ubername,
            });
        }
    }
}
