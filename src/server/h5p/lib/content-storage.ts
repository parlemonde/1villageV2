import type { ContentId, IContentMetadata, IContentStorage, IFileStats, ILibraryName, IUser } from '@lumieducation/h5p-server';
import { H5pError } from '@lumieducation/h5p-server';
import { db } from '@server/database';
import { h5pContents } from '@server/database/schemas/h5p';
import { deleteFile, getFile, getFileData, listFiles, uploadFile } from '@server/files/file-upload';
import { logger } from '@server/lib/logger';
import { and, eq, sql } from 'drizzle-orm';
import type { Readable } from 'stream';
import { v4 } from 'uuid';

import { validateFilename } from './sanitize-filename';

const getStaticStorageKey = (contentId: ContentId, filename: string) => {
    const key = `h5p/content/${contentId}/${filename}`;
    if (key.length > 1024) {
        logger.error(`The key for "${filename}" in content object with id ${contentId} is ${key.length} bytes long, but only 1024 are allowed.`);
        throw new H5pError('content-storage:filename-too-long', { filename }, 400);
    }
    return key;
};

export class ContentStorage implements IContentStorage {
    public async addContent(metadata: IContentMetadata, content: unknown, user: IUser, contentId?: string | undefined): Promise<string> {
        try {
            const newContentId = contentId || v4();
            await db
                .insert(h5pContents)
                .values({
                    id: newContentId,
                    metadata,
                    parameters: content,
                    creatorId: user.id,
                })
                .onConflictDoUpdate({
                    target: h5pContents.id,
                    set: {
                        metadata: metadata as typeof h5pContents.$inferInsert.metadata,
                        parameters: content as typeof h5pContents.$inferInsert.parameters,
                    },
                });
            return newContentId;
        } catch (error) {
            logger.error(`Error when adding or updating content: ${error instanceof Error ? error.message : ''}`);
            throw new H5pError('content-storage:add-update-error', {}, 500);
        }
    }

    public async addFile(contentId: string, filename: string, readStream: Readable): Promise<void> {
        validateFilename(filename);
        try {
            await uploadFile(getStaticStorageKey(contentId, filename), readStream);
        } catch (error) {
            logger.error(`Error while uploading file "${filename}" to storage: ${error instanceof Error ? error.message : ''}`);
            throw new H5pError(`content-storage:upload-error`, { filename }, 500);
        }
    }

    public async contentExists(contentId: string): Promise<boolean> {
        try {
            const rows = await db.select({ id: h5pContents.id }).from(h5pContents).where(eq(h5pContents.id, contentId)).limit(1);
            return rows.length > 0;
        } catch (error) {
            logger.error(error);
            return false;
        }
    }

    public async deleteContent(contentId: string): Promise<void> {
        logger.warn(`Deleting content with id ${contentId}.`);
        try {
            const filesToDelete = await this.listFiles(contentId);
            while (filesToDelete.length > 0) {
                const next1000Files = filesToDelete.splice(0, 1000);
                if (next1000Files.length > 0) {
                    await Promise.all(next1000Files.map((f) => deleteFile(getStaticStorageKey(contentId, f))));
                }
            }
            await db.delete(h5pContents).where(eq(h5pContents.id, contentId));
        } catch (error) {
            logger.error(`There was an error while deleting the content object: ${error instanceof Error ? error.message : ''}`);
            throw new H5pError('content-storage:deleting-content-error', {}, 500);
        }
    }

    public async deleteFile(contentId: string, filename: string): Promise<void> {
        validateFilename(filename);
        try {
            await deleteFile(getStaticStorageKey(contentId, filename));
        } catch (error) {
            logger.error(`Error while deleting a file from storage: ${error instanceof Error ? error.message : ''}`);
            throw new H5pError('content-storage:deleting-file-error', { filename }, 500);
        }
    }

    public async fileExists(contentId: string, filename: string): Promise<boolean> {
        validateFilename(filename);
        try {
            const result = await getFileData(getStaticStorageKey(contentId, filename));
            return result !== null && result.ContentLength > 0;
        } catch (error) {
            logger.error(error);
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
            logger.error(`ContentId not set!`);
            throw new H5pError('content-storage:content-not-found', {}, 404);
        }

        const readable = await getFile(
            getStaticStorageKey(contentId, filename),
            rangeStart && rangeEnd ? `bytes=${rangeStart}-${rangeEnd}` : undefined,
        );
        if (!readable) {
            logger.error(`File not found: ${getStaticStorageKey(contentId, filename)}`);
            throw new H5pError('content-storage:file-not-found', { contentId, filename }, 404);
        }

        return readable;
    }

    public async getMetadata(contentId: string): Promise<IContentMetadata> {
        const rows = await db.select({ metadata: h5pContents.metadata }).from(h5pContents).where(eq(h5pContents.id, contentId)).limit(1);
        if (rows.length === 0) {
            throw new H5pError('content-storage:content-not-found', {}, 404);
        }
        return rows[0].metadata as IContentMetadata;
    }

    public async getParameters(contentId: string): Promise<unknown> {
        const rows = await db.select({ parameters: h5pContents.parameters }).from(h5pContents).where(eq(h5pContents.id, contentId)).limit(1);
        if (rows.length === 0) {
            throw new H5pError('content-storage:content-not-found', {}, 404);
        }
        return rows[0].parameters;
    }

    public async getUsage(library: ILibraryName): Promise<{ asDependency: number; asMainLibrary: number }> {
        try {
            const libraryJson = JSON.stringify({
                machineName: library.machineName,
                majorVersion: library.majorVersion,
                minorVersion: library.minorVersion,
            });

            const [asMainLibraryResult] = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(h5pContents)
                .where(
                    and(
                        sql`${h5pContents.metadata}->>'mainLibrary' = ${library.machineName}`,
                        sql`${h5pContents.metadata}->'preloadedDependencies' @> ${libraryJson}::jsonb`,
                    ),
                );

            const [asDependencyResult] = await db
                .select({ count: sql<number>`count(*)::int` })
                .from(h5pContents)
                .where(
                    and(
                        sql`${h5pContents.metadata}->>'mainLibrary' <> ${library.machineName}`,
                        sql`(
                            ${h5pContents.metadata}->'preloadedDependencies' @> ${libraryJson}::jsonb
                            OR ${h5pContents.metadata}->'dynamicDependencies' @> ${libraryJson}::jsonb
                            OR ${h5pContents.metadata}->'editorDependencies' @> ${libraryJson}::jsonb
                        )`,
                    ),
                );

            return { asMainLibrary: asMainLibraryResult.count, asDependency: asDependencyResult.count };
        } catch (error) {
            logger.error(error);
            return { asMainLibrary: 0, asDependency: 0 };
        }
    }

    public async listContent(): Promise<string[]> {
        try {
            const rows = await db.select({ id: h5pContents.id }).from(h5pContents);
            return rows.map((r) => r.id);
        } catch (error) {
            logger.error(error);
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
            logger.error(error);
            logger.error(`There was an error while getting list of files from storage.`);
            return [];
        }
        logger.info(`Found ${files.length} file(s) in storage.`);
        return files;
    }
}
