import type { IContentUserData, IContentUserDataStorage, IFinishedUserData, IUser } from '@lumieducation/h5p-server';
import { H5pError } from '@lumieducation/h5p-server';
import { db } from '@server/database';
import { h5pContentUserData, h5pFinishedData } from '@server/database/schemas/h5p';
import { logger } from '@server/lib/logger';
import { and, eq } from 'drizzle-orm';

const toContentUserData = (row: typeof h5pContentUserData.$inferSelect): IContentUserData => ({
    contentId: row.contentId,
    userId: row.userId,
    dataType: row.dataType,
    subContentId: row.subContentId,
    contextId: row.contextId || undefined,
    userState: row.userState,
    preload: row.preload,
    invalidate: row.invalidate,
});

const toFinishedData = (row: typeof h5pFinishedData.$inferSelect): IFinishedUserData => ({
    contentId: row.contentId,
    userId: row.userId,
    score: row.score ?? 0,
    maxScore: row.maxScore ?? 0,
    openedTimestamp: row.openedTimestamp ?? 0,
    finishedTimestamp: row.finishedTimestamp ?? 0,
    completionTime: row.completionTime ?? 0,
});

export class ContentUserDataStorage implements IContentUserDataStorage {
    public async createOrUpdateContentUserData(userData: IContentUserData): Promise<void> {
        if (!userData.contentId || !userData.userId) {
            return;
        }
        await db
            .insert(h5pContentUserData)
            .values({
                contentId: userData.contentId,
                userId: userData.userId,
                dataType: userData.dataType,
                subContentId: userData.subContentId,
                contextId: userData.contextId ?? '',
                userState: userData.userState,
                preload: userData.preload,
                invalidate: userData.invalidate,
            })
            .onConflictDoUpdate({
                target: [
                    h5pContentUserData.contentId,
                    h5pContentUserData.userId,
                    h5pContentUserData.dataType,
                    h5pContentUserData.subContentId,
                    h5pContentUserData.contextId,
                ],
                set: {
                    userState: userData.userState,
                    preload: userData.preload,
                    invalidate: userData.invalidate,
                },
            });
    }

    public async deleteInvalidatedContentUserData(contentId: string): Promise<void> {
        try {
            await db.delete(h5pContentUserData).where(and(eq(h5pContentUserData.contentId, contentId), eq(h5pContentUserData.invalidate, true)));
        } catch (error) {
            logger.error(`Error deleting invalidated content user data for content ${contentId}: ${error instanceof Error ? error.message : ''}`);
            throw new H5pError('Could not delete content user data');
        }
    }

    public async deleteAllContentUserDataByUser(user: IUser): Promise<void> {
        try {
            await db.delete(h5pContentUserData).where(eq(h5pContentUserData.userId, user.id));
        } catch (error) {
            logger.error(`Error deleting all content user data for user ${user.id}: ${error instanceof Error ? error.message : ''}`);
            throw new H5pError('Could not delete content user data');
        }
    }

    public async deleteAllContentUserDataByContentId(contentId: string): Promise<void> {
        try {
            await db.delete(h5pContentUserData).where(eq(h5pContentUserData.contentId, contentId));
        } catch (error) {
            logger.error(`Error deleting all content user data for content ${contentId}: ${error instanceof Error ? error.message : ''}`);
            throw new H5pError('Could not delete content user data');
        }
    }

    public async getContentUserData(
        contentId: string,
        dataType: string,
        subContentId: string,
        userId: string,
        contextId?: string | undefined,
    ): Promise<IContentUserData> {
        const rows = await db
            .select()
            .from(h5pContentUserData)
            .where(
                and(
                    eq(h5pContentUserData.contentId, contentId),
                    eq(h5pContentUserData.userId, userId),
                    eq(h5pContentUserData.dataType, dataType),
                    eq(h5pContentUserData.subContentId, subContentId),
                    eq(h5pContentUserData.contextId, contextId ?? ''),
                ),
            )
            .limit(1);
        if (rows.length === 0) {
            throw new H5pError('content-user-data-storage:get-content-user-data-not-found', undefined, 404);
        }
        return toContentUserData(rows[0]);
    }

    public async getContentUserDataByContentIdAndUser(
        contentId: string,
        userId: string,
        contextId?: string | undefined,
    ): Promise<IContentUserData[]> {
        const conditions = [eq(h5pContentUserData.contentId, contentId), eq(h5pContentUserData.userId, userId)];
        if (contextId !== undefined) {
            conditions.push(eq(h5pContentUserData.contextId, contextId));
        }
        const rows = await db
            .select()
            .from(h5pContentUserData)
            .where(and(...conditions));
        return rows.map(toContentUserData);
    }

    public async getContentUserDataByUser(user: IUser): Promise<IContentUserData[]> {
        const rows = await db.select().from(h5pContentUserData).where(eq(h5pContentUserData.userId, user.id));
        return rows.map(toContentUserData);
    }

    public async createOrUpdateFinishedData(finishedData: IFinishedUserData): Promise<void> {
        if (!finishedData.contentId || !finishedData.userId) {
            return;
        }
        await db
            .insert(h5pFinishedData)
            .values({
                contentId: finishedData.contentId,
                userId: finishedData.userId,
                score: finishedData.score,
                maxScore: finishedData.maxScore,
                openedTimestamp: finishedData.openedTimestamp,
                finishedTimestamp: finishedData.finishedTimestamp,
                completionTime: finishedData.completionTime,
            })
            .onConflictDoUpdate({
                target: [h5pFinishedData.contentId, h5pFinishedData.userId],
                set: {
                    score: finishedData.score,
                    maxScore: finishedData.maxScore,
                    openedTimestamp: finishedData.openedTimestamp,
                    finishedTimestamp: finishedData.finishedTimestamp,
                    completionTime: finishedData.completionTime,
                },
            });
    }

    public async getFinishedDataByContentId(contentId: string): Promise<IFinishedUserData[]> {
        const rows = await db.select().from(h5pFinishedData).where(eq(h5pFinishedData.contentId, contentId));
        return rows.map(toFinishedData);
    }

    public async getFinishedDataByUser(user: IUser): Promise<IFinishedUserData[]> {
        const rows = await db.select().from(h5pFinishedData).where(eq(h5pFinishedData.userId, user.id));
        return rows.map(toFinishedData);
    }

    public async deleteFinishedDataByContentId(contentId: string): Promise<void> {
        try {
            await db.delete(h5pFinishedData).where(eq(h5pFinishedData.contentId, contentId));
        } catch (error) {
            logger.error(`Error deleting finished data for content ${contentId}: ${error instanceof Error ? error.message : ''}`);
            throw new H5pError('Could not delete finished data');
        }
    }

    public async deleteFinishedDataByUser(user: IUser): Promise<void> {
        try {
            await db.delete(h5pFinishedData).where(eq(h5pFinishedData.userId, user.id));
        } catch (error) {
            logger.error(`Error deleting finished data for user ${user.id}: ${error instanceof Error ? error.message : ''}`);
            throw new H5pError('Could not delete finished data');
        }
    }
}
