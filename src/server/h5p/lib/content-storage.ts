import type { ContentId, IContentMetadata, IContentStorage, IFileStats, ILibraryName, IUser } from '@lumieducation/h5p-server';
import { H5pError } from '@lumieducation/h5p-server';
import { deleteDynamoDBItem, getDynamoDBItem, scanDynamoDB, setDynamoDBItem } from '@server/aws/dynamodb';
import { deleteFile, getFile, getFileData, listFiles, uploadFile } from '@server/files/file-upload';
import type { Readable } from 'stream';
import { v4 } from 'uuid';

import { validateFilename } from './sanitize-filename';

const CONTENT_PREFIX = `H5P_Content_`;

const getStaticStorageKey = (contentId: ContentId, filename: string) => {
    const key = `h5p/content/${contentId}/${filename}`;
    if (key.length > 1024) {
        console.error(`The key for "${filename}" in content object with id ${contentId} is ${key.length} bytes long, but only 1024 are allowed.`);
        throw new H5pError('content-storage:filename-too-long', { filename }, 400);
    }
    return key;
};

export class ContentStorage implements IContentStorage {
    public async addContent(metadata: IContentMetadata, content: unknown, user: IUser, contentId?: string | undefined): Promise<string> {
        try {
            const newContentId = contentId || v4();
            await setDynamoDBItem(`${CONTENT_PREFIX}${newContentId}`, {
                metadata,
                parameters: content,
                creator: user.id,
            });
            return newContentId;
        } catch (error) {
            console.error(`Error when adding or updating content in MongoDB: ${error instanceof Error ? error.message : ''}`);
            throw new H5pError('content-storage:add-update-error', {}, 500);
        }
    }

    public async addFile(contentId: string, filename: string, readStream: Readable): Promise<void> {
        validateFilename(filename);
        try {
            await uploadFile(getStaticStorageKey(contentId, filename), readStream);
        } catch (error) {
            console.error(`Error while uploading file "${filename}" to storage: ${error instanceof Error ? error.message : ''}`);
            throw new H5pError(`content-storage:upload-error`, { filename }, 500);
        }
    }

    public async contentExists(contentId: string): Promise<boolean> {
        try {
            const result = await getDynamoDBItem<unknown>(`${CONTENT_PREFIX}${contentId}`);
            return result !== undefined;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    public async deleteContent(contentId: string): Promise<void> {
        console.warn(`Deleting content with id ${contentId}.`);
        try {
            // 1. Delete all files from the storage
            // S3 batch deletes only work with 1000 files at a time, so we might have to do this in several requests.
            const filesToDelete = await this.listFiles(contentId);
            while (filesToDelete.length > 0) {
                const next1000Files = filesToDelete.splice(0, 1000);
                if (next1000Files.length > 0) {
                    await Promise.all(next1000Files.map((f) => deleteFile(getStaticStorageKey(contentId, f))));
                }
            }

            // 2. Delete the content object from DynamoDB
            await deleteDynamoDBItem(`${CONTENT_PREFIX}${contentId}`);
        } catch (error) {
            console.error(`There was an error while deleting the content object: ${error instanceof Error ? error.message : ''}`);
            throw new H5pError('content-storage:deleting-content-error', {}, 500);
        }
    }

    public async deleteFile(contentId: string, filename: string): Promise<void> {
        validateFilename(filename);
        try {
            await deleteFile(getStaticStorageKey(contentId, filename));
        } catch (error) {
            console.error(`Error while deleting a file from storage: ${error instanceof Error ? error.message : ''}`);
            throw new H5pError('content-storage:deleting-file-error', { filename }, 500);
        }
    }

    public async fileExists(contentId: string, filename: string): Promise<boolean> {
        validateFilename(filename);
        try {
            const result = await getFileData(getStaticStorageKey(contentId, filename));
            return result !== null && result.ContentLength > 0;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    public async getFileStats(contentId: string, filename: string): Promise<IFileStats> {
        validateFilename(filename);
        const metadata = await getFileData(getStaticStorageKey(contentId, filename));
        if (!metadata) {
            throw new H5pError('content-file-missing', { contentId, filename }, 404);
        }
        return { size: metadata.ContentLength, birthtime: metadata.LastModified };
    }

    public async getFileStream(
        contentId: string,
        filename: string,
        _user: IUser,
        rangeStart?: number | undefined,
        rangeEnd?: number | undefined,
    ): Promise<Readable> {
        validateFilename(filename);

        if (!contentId) {
            console.error(`ContentId not set!`);
            throw new H5pError('content-storage:content-not-found', {}, 404);
        }

        const readable = await getFile(
            getStaticStorageKey(contentId, filename),
            rangeStart && rangeEnd ? `bytes=${rangeStart}-${rangeEnd}` : undefined,
        );
        if (!readable) {
            console.error(`File not found: ${getStaticStorageKey(contentId, filename)}`);
            throw new H5pError('content-storage:file-not-found', { contentId, filename }, 404);
        }

        return readable;
    }

    public async getMetadata(contentId: string): Promise<IContentMetadata> {
        const result = await getDynamoDBItem<{ metadata: IContentMetadata }>(`${CONTENT_PREFIX}${contentId}`);
        if (!result) {
            throw new H5pError('content-storage:content-not-found', {}, 404);
        }
        return result.metadata;
    }

    public async getParameters(contentId: string): Promise<unknown> {
        const result = await getDynamoDBItem<{ parameters: unknown }>(`${CONTENT_PREFIX}${contentId}`);
        if (!result) {
            throw new H5pError('content-storage:content-not-found', {}, 404);
        }
        return result.parameters;
    }

    public async getUsage(library: ILibraryName): Promise<{ asDependency: number; asMainLibrary: number }> {
        try {
            const asMainLibraryResults = await scanDynamoDB<unknown>({
                filterExpression:
                    'begins_with(#key, :prefix )AND #value.metadata.mainLibrary = :machineName AND contains(#value.metadata.preloadedDependencies, :mainLibrary)',
                expressionAttributeNames: { '#key': 'key', '#value': 'value' },
                expressionAttributeValues: {
                    ':prefix': CONTENT_PREFIX,
                    ':machineName': library.machineName,
                    ':mainLibrary': { machineName: library.machineName, majorVersion: library.majorVersion, minorVersion: library.minorVersion },
                },
            });
            const asDependencyResults = await scanDynamoDB<unknown>({
                filterExpression:
                    'begins_with(#key, :prefix )AND #value.metadata.mainLibrary <> :machineName AND (contains(#value.metadata.preloadedDependencies, :library) OR contains(#value.metadata.dynamicDependencies, :library) OR contains(#value.metadata.editorDependencies, :library))',
                expressionAttributeNames: { '#key': 'key', '#value': 'value' },
                expressionAttributeValues: {
                    ':prefix': CONTENT_PREFIX,
                    ':machineName': library.machineName,
                    ':library': {
                        machineName: library.machineName,
                        majorVersion: library.majorVersion,
                        minorVersion: library.minorVersion,
                    },
                },
            });
            return { asMainLibrary: asMainLibraryResults.length, asDependency: asDependencyResults.length };
        } catch (error) {
            console.error(error);
            return { asMainLibrary: 0, asDependency: 0 };
        }
    }

    public async listContent(): Promise<string[]> {
        try {
            const result = await scanDynamoDB<unknown>({
                filterExpression: 'begins_with(#key, :prefix)',
                expressionAttributeNames: { '#key': 'key' },
                expressionAttributeValues: { ':prefix': CONTENT_PREFIX },
            });
            return result.map((r) => r.key.slice(CONTENT_PREFIX.length));
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    public async listFiles(contentId: string): Promise<string[]> {
        const prefix = getStaticStorageKey(contentId, '');
        let files: string[] = [];
        try {
            let result: { files: string[]; nextContinuationToken?: string } | undefined;
            do {
                result = await listFiles(prefix, result?.nextContinuationToken);
                files = files.concat(result.files.map((f) => f.slice(prefix.length)));
            } while (result.nextContinuationToken);
        } catch (error) {
            console.error(error);
            console.error(`There was an error while getting list of files from storage.`);
            return [];
        }
        // eslint-disable-next-line no-console
        console.info(`Found ${files.length} file(s) in storage.`);
        return files;
    }
}
