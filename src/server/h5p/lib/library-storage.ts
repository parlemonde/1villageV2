import type {
    IAdditionalLibraryMetadata,
    IInstalledLibrary,
    ILibraryMetadata,
    ILibraryName,
    ILibraryStorage,
    IFileStats,
} from '@lumieducation/h5p-server';
import { InstalledLibrary, streamToString, LibraryName, H5pError } from '@lumieducation/h5p-server';
import { db } from '@server/database';
import { h5pLibraries } from '@server/database/schemas/h5p';
import { deleteFile, getFile, getFileData, listFiles, uploadFile } from '@server/files/file-upload';
import { logger } from '@server/lib/logger';
import { eq, sql } from 'drizzle-orm';
import * as path from 'path';
import { Readable } from 'stream';

import { validateFilename } from './sanitize-filename';

type LibraryDep = {
    dynamicDependencies: ILibraryName[];
    editorDependencies: ILibraryName[];
    machineName: string;
    majorVersion: number;
    minorVersion: number;
    preloadedDependencies: ILibraryName[];
    ubername: string;
};

const getKey = (library: ILibraryName, filename: string): string => {
    const key = `h5p/libraries/${LibraryName.toUberName(library)}/${filename}`;
    if (key.length > 1024) {
        logger.error(
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
        const rows = await db
            .select({ metadata: h5pLibraries.metadata })
            .from(h5pLibraries)
            .where(eq(h5pLibraries.ubername, LibraryName.toUberName(library)))
            .limit(1);
        if (rows.length === 0) {
            throw new H5pError('storage:error-getting-library-metadata', { ubername: LibraryName.toUberName(library) });
        }
        return rows[0].metadata as unknown as ILibraryMetadata;
    }

    public async addFile(library: ILibraryName, filename: string, readStream: Readable): Promise<boolean> {
        validateFilename(filename);
        try {
            await uploadFile(getKey(library, filename), readStream);
        } catch (error) {
            logger.error(`Error while uploading file "${filename}" to S3 storage: ${error instanceof Error ? error.message : ''}`);
            throw new H5pError(`library-storage:s3-upload-error`, { ubername: LibraryName.toUberName(library), filename }, 500);
        }
        return true;
    }

    public async addLibrary(libraryData: ILibraryMetadata, restricted: boolean): Promise<IInstalledLibrary> {
        const ubername = LibraryName.toUberName(libraryData);
        try {
            await db
                .insert(h5pLibraries)
                .values({
                    ubername,
                    machineName: libraryData.machineName,
                    metadata: libraryData as typeof h5pLibraries.$inferInsert.metadata,
                    additionalMetadata: { restricted },
                })
                .onConflictDoUpdate({
                    target: h5pLibraries.ubername,
                    set: {
                        machineName: libraryData.machineName,
                        metadata: libraryData as typeof h5pLibraries.$inferInsert.metadata,
                        additionalMetadata: { restricted },
                    },
                });
        } catch (error) {
            logger.error(error);
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
        try {
            while (filesToDelete.length > 0) {
                const next1000Files = filesToDelete.splice(0, 1000);
                if (next1000Files.length > 0) {
                    await Promise.all(next1000Files.map((f) => deleteFile(getKey(library, f))));
                }
            }
        } catch (error) {
            logger.error(`There was an error while clearing the files: ${error instanceof Error ? error.message : ''}`);
            throw new H5pError('library-storage:deleting-files-error');
        }
    }

    public async deleteLibrary(library: ILibraryName): Promise<void> {
        if (!(await this.isInstalled(library))) {
            throw new H5pError('library-storage:library-not-found');
        }
        await this.clearFiles(library);

        try {
            await db.delete(h5pLibraries).where(eq(h5pLibraries.ubername, LibraryName.toUberName(library)));
        } catch (error) {
            logger.error(error);
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
            logger.error(error);
            return false;
        }
    }

    public async getAllDependentsCount(): Promise<{ [ubername: string]: number }> {
        let libraryDeps: LibraryDep[] = [];
        try {
            const allLibraries = await db
                .select({ ubername: h5pLibraries.ubername, machineName: h5pLibraries.machineName, metadata: h5pLibraries.metadata })
                .from(h5pLibraries);
            libraryDeps = allLibraries.map<LibraryDep>((row) => {
                const metadata = row.metadata as unknown as ILibraryMetadata;
                return {
                    dynamicDependencies: metadata.dynamicDependencies || [],
                    editorDependencies: metadata.editorDependencies || [],
                    machineName: row.machineName,
                    majorVersion: metadata.majorVersion,
                    minorVersion: metadata.minorVersion,
                    preloadedDependencies: metadata.preloadedDependencies || [],
                    ubername: row.ubername,
                };
            });
        } catch (error) {
            logger.error(error);
            throw new H5pError('library-storage:error-getting-dependents');
        }

        const librariesDepsMap: {
            [ubername: string]: LibraryDep;
        } = libraryDeps.reduce<{
            [ubername: string]: LibraryDep;
        }>((prev, curr) => {
            prev[curr.ubername] = curr;
            return prev;
        }, {});

        for (const lib of libraryDeps) {
            for (const dependency of lib.editorDependencies ?? []) {
                const ubername = LibraryName.toUberName(dependency);
                const index = librariesDepsMap[ubername].preloadedDependencies?.findIndex((ln) => LibraryName.equal(ln, lib));
                if (index >= 0) {
                    librariesDepsMap[ubername].preloadedDependencies.splice(index, 1);
                }
            }
        }

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
            const libraryJson = JSON.stringify({
                machineName: library.machineName,
                majorVersion: library.majorVersion,
                minorVersion: library.minorVersion,
            });
            const [result] = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(h5pLibraries)
                .where(
                    sql`(
                        ${h5pLibraries.metadata}->'preloadedDependencies' @> ${libraryJson}::jsonb
                        OR ${h5pLibraries.metadata}->'editorDependencies' @> ${libraryJson}::jsonb
                        OR ${h5pLibraries.metadata}->'dynamicDependencies' @> ${libraryJson}::jsonb
                    )`,
                );
            return result.count;
        } catch (error) {
            logger.error(error);
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
            let rows: { ubername: string }[];
            if (machineName) {
                rows = await db.select({ ubername: h5pLibraries.ubername }).from(h5pLibraries).where(eq(h5pLibraries.machineName, machineName));
            } else {
                rows = await db.select({ ubername: h5pLibraries.ubername }).from(h5pLibraries);
            }
            return rows.map((d) => LibraryName.fromUberName(d.ubername));
        } catch (error) {
            logger.error(error);
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
            logger.error(
                `There was an error while getting list of files from S3. This might not be a problem if no languages were added to the library.`,
            );
            return [];
        }
    }

    public async getLibrary(library: ILibraryName): Promise<IInstalledLibrary> {
        if (!library) {
            throw new Error('You must pass in a library name to getLibrary.');
        }
        const rows = await db
            .select({ metadata: h5pLibraries.metadata, additionalMetadata: h5pLibraries.additionalMetadata })
            .from(h5pLibraries)
            .where(eq(h5pLibraries.ubername, LibraryName.toUberName(library)))
            .limit(1);
        if (rows.length === 0) {
            throw new H5pError('library-storage:error-getting-library-metadata', { ubername: LibraryName.toUberName(library) });
        }
        const { metadata, additionalMetadata } = rows[0];
        return InstalledLibrary.fromMetadata({
            ...(metadata as unknown as ILibraryMetadata),
            ...(additionalMetadata as unknown as Record<string, unknown>),
        });
    }

    public async isInstalled(library: ILibraryName): Promise<boolean> {
        try {
            const rows = await db
                .select({ ubername: h5pLibraries.ubername })
                .from(h5pLibraries)
                .where(eq(h5pLibraries.ubername, LibraryName.toUberName(library)))
                .limit(1);
            return rows.length > 0;
        } catch (error) {
            logger.error(error);
            return false;
        }
    }

    public async listAddons(): Promise<ILibraryMetadata[]> {
        try {
            const rows = await db
                .select({ metadata: h5pLibraries.metadata })
                .from(h5pLibraries)
                .where(sql`${h5pLibraries.metadata} ? 'addTo'`);
            return rows.map((row) => row.metadata as unknown as ILibraryMetadata);
        } catch (error) {
            logger.error(error);
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
            logger.error(error);
            return [];
        }
    }

    public async updateAdditionalMetadata(library: ILibraryName, additionalMetadata: Partial<IAdditionalLibraryMetadata>): Promise<boolean> {
        if (!library) {
            throw new Error('You must specify a library name when calling updateAdditionalMetadata.');
        }
        const ubername = LibraryName.toUberName(library);
        try {
            const rows = await db
                .select({ currentMetadata: h5pLibraries.additionalMetadata })
                .from(h5pLibraries)
                .where(eq(h5pLibraries.ubername, ubername))
                .limit(1);
            const current = rows[0]?.currentMetadata as Record<string, unknown> | undefined;

            if (current === undefined) {
                throw new H5pError('library-storage:library-not-found');
            }

            await db
                .update(h5pLibraries)
                .set({
                    additionalMetadata: { ...current, ...additionalMetadata } as typeof h5pLibraries.$inferInsert.additionalMetadata,
                })
                .where(eq(h5pLibraries.ubername, ubername));
        } catch (error) {
            if (error instanceof H5pError) {
                throw error;
            }
            logger.error(error);
            throw new H5pError('library-storage:update-additional-metadata-error', {
                ubername,
            });
        }
        return true;
    }

    public async updateLibrary(libraryMetadata: ILibraryMetadata): Promise<IInstalledLibrary> {
        const ubername = LibraryName.toUberName(libraryMetadata);

        try {
            await db
                .insert(h5pLibraries)
                .values({
                    ubername,
                    machineName: libraryMetadata.machineName,
                    metadata: libraryMetadata as typeof h5pLibraries.$inferInsert.metadata,
                    additionalMetadata: {},
                })
                .onConflictDoUpdate({
                    target: h5pLibraries.ubername,
                    set: {
                        machineName: libraryMetadata.machineName,
                        metadata: libraryMetadata as typeof h5pLibraries.$inferInsert.metadata,
                    },
                });

            const rows = await db
                .select({ additionalMetadata: h5pLibraries.additionalMetadata })
                .from(h5pLibraries)
                .where(eq(h5pLibraries.ubername, ubername))
                .limit(1);
            const additionalMetadata = (rows[0]?.additionalMetadata as Record<string, unknown>) ?? {};

            return InstalledLibrary.fromMetadata({
                ...libraryMetadata,
                ...additionalMetadata,
            });
        } catch (error) {
            logger.error(error);
            throw new H5pError('library-storage:update-error', {
                ubername,
            });
        }
    }
}
