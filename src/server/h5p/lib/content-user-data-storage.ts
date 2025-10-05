import type { IContentUserData, IContentUserDataStorage, IFinishedUserData, IUser } from '@lumieducation/h5p-server';
import { H5pError } from '@lumieducation/h5p-server';
import { deleteDynamoDBItems, getDynamoDBItem, scanDynamoDB, setDynamoDBItem } from '@server/aws/dynamodb';

const USER_DATA_PREFIX = `H5P_UserDataContent_`;
const getUserDataKey = (contentId: string, dataType: string, subContentId: string, userId: string, contextId?: string | undefined): string =>
    `${USER_DATA_PREFIX}${contentId}_${dataType}_${subContentId}_${userId}_${contextId ?? ''}`;

const FINISHED_DATA_PREFIX = `H5P_FinishedData_`;
const getFinishedDataKey = (contentId: string, userId: string): string => `${FINISHED_DATA_PREFIX}${contentId}_${userId}`;

export class ContentUserDataStorage implements IContentUserDataStorage {
    public async createOrUpdateContentUserData(userData: IContentUserData): Promise<void> {
        if (!userData.contentId || !userData.userId) {
            return;
        }
        await setDynamoDBItem(
            getUserDataKey(userData.contentId, userData.dataType, userData.subContentId, userData.userId, userData.contextId),
            userData,
        );
    }

    public async deleteInvalidatedContentUserData(contentId: string): Promise<void> {
        try {
            const keysToDelete = await scanDynamoDB({
                filterExpression: 'begins_with(#key, :prefix )AND #value.contentId = :contentId AND #value.invalidate = :invalidate',
                expressionAttributeNames: { '#key': 'key', '#value': 'value' },
                expressionAttributeValues: { ':prefix': USER_DATA_PREFIX, ':contentId': contentId, ':invalidate': true },
            }).then((results) => results.map((row) => row.key));
            await deleteDynamoDBItems(keysToDelete);
        } catch (error) {
            console.error(error);
            throw new H5pError('Could not delete content user data');
        }
    }

    public async deleteAllContentUserDataByUser(user: IUser): Promise<void> {
        try {
            const keysToDelete = await scanDynamoDB({
                filterExpression: 'begins_with(#key, :prefix )AND #value.userId = :userId',
                expressionAttributeNames: { '#key': 'key', '#value': 'value' },
                expressionAttributeValues: { ':prefix': USER_DATA_PREFIX, ':userId': user.id },
            }).then((results) => results.map((row) => row.key));
            await deleteDynamoDBItems(keysToDelete);
        } catch (error) {
            console.error(error);
            throw new H5pError('Could not delete content user data');
        }
    }

    public async deleteAllContentUserDataByContentId(contentId: string): Promise<void> {
        try {
            const keysToDelete = await scanDynamoDB({
                filterExpression: 'begins_with(#key, :prefix )AND #value.contentId = :contentId',
                expressionAttributeNames: { '#key': 'key', '#value': 'value' },
                expressionAttributeValues: { ':prefix': USER_DATA_PREFIX, ':contentId': contentId },
            }).then((results) => results.map((row) => row.key));
            await deleteDynamoDBItems(keysToDelete);
        } catch (error) {
            console.error(error);
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
        const result = await getDynamoDBItem<IContentUserData>(getUserDataKey(contentId, dataType, subContentId, userId, contextId));
        if (result === undefined) {
            throw new H5pError('content-user-data-storage:get-content-user-data-not-found', undefined, 404);
        }
        return result;
    }

    public async getContentUserDataByContentIdAndUser(
        contentId: string,
        userId: string,
        contextId?: string | undefined,
    ): Promise<IContentUserData[]> {
        if (contextId !== undefined) {
            return scanDynamoDB<IContentUserData>({
                filterExpression:
                    'begins_with(#key, :prefix )AND #value.contentId = :contentId AND #value.userId = :userId AND #value.contextId = :contextId',
                expressionAttributeNames: { '#key': 'key', '#value': 'value' },
                expressionAttributeValues: { ':prefix': USER_DATA_PREFIX, ':contentId': contentId, ':userId': userId, ':contextId': contextId },
            }).then((results) => results.map((row) => row.value));
        } else {
            return scanDynamoDB<IContentUserData>({
                filterExpression: 'begins_with(#key, :prefix )AND #value.contentId = :contentId AND #value.userId = :userId',
                expressionAttributeNames: { '#key': 'key', '#value': 'value' },
                expressionAttributeValues: { ':prefix': USER_DATA_PREFIX, ':contentId': contentId, ':userId': userId },
            }).then((results) => results.map((row) => row.value));
        }
    }

    public async getContentUserDataByUser(user: IUser): Promise<IContentUserData[]> {
        return scanDynamoDB<IContentUserData>({
            filterExpression: 'begins_with(#key, :prefix )AND #value.userId = :userId',
            expressionAttributeNames: { '#key': 'key', '#value': 'value' },
            expressionAttributeValues: { ':prefix': USER_DATA_PREFIX, ':userId': user.id },
        }).then((results) => results.map((row) => row.value));
    }

    public async createOrUpdateFinishedData(finishedData: IFinishedUserData): Promise<void> {
        if (!finishedData.contentId || !finishedData.userId) {
            return;
        }

        await setDynamoDBItem(getFinishedDataKey(finishedData.contentId, finishedData.userId), finishedData);
    }

    public async getFinishedDataByContentId(contentId: string): Promise<IFinishedUserData[]> {
        return scanDynamoDB<IFinishedUserData>({
            filterExpression: 'begins_with(#key, :prefix )AND #value.contentId = :contentId',
            expressionAttributeNames: { '#key': 'key', '#value': 'value' },
            expressionAttributeValues: { ':prefix': FINISHED_DATA_PREFIX, ':contentId': contentId },
        }).then((results) => results.map((row) => row.value));
    }

    public async getFinishedDataByUser(user: IUser): Promise<IFinishedUserData[]> {
        return scanDynamoDB<IFinishedUserData>({
            filterExpression: 'begins_with(#key, :prefix )AND #value.userId = :userId',
            expressionAttributeNames: { '#key': 'key', '#value': 'value' },
            expressionAttributeValues: { ':prefix': FINISHED_DATA_PREFIX, ':userId': user.id },
        }).then((results) => results.map((row) => row.value));
    }

    public async deleteFinishedDataByContentId(contentId: string): Promise<void> {
        try {
            const keysToDelete = await scanDynamoDB({
                filterExpression: 'begins_with(#key, :prefix )AND #value.contentId = :contentId',
                expressionAttributeNames: { '#key': 'key', '#value': 'value' },
                expressionAttributeValues: { ':prefix': FINISHED_DATA_PREFIX, ':contentId': contentId },
            }).then((results) => results.map((row) => row.key));
            await deleteDynamoDBItems(keysToDelete);
        } catch (error) {
            console.error(error);
            throw new H5pError('Could not delete finished data');
        }
    }

    public async deleteFinishedDataByUser(user: IUser): Promise<void> {
        try {
            const keysToDelete = await scanDynamoDB({
                filterExpression: 'begins_with(#key, :prefix )AND #value.userId = :userId',
                expressionAttributeNames: { '#key': 'key', '#value': 'value' },
                expressionAttributeValues: { ':prefix': FINISHED_DATA_PREFIX, ':userId': user.id },
            }).then((results) => results.map((row) => row.key));
            await deleteDynamoDBItems(keysToDelete);
        } catch (error) {
            console.error(error);
            throw new H5pError('Could not delete finished data');
        }
    }
}
