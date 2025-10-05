import type { IKeyValueStorage } from '@lumieducation/h5p-server';
import { H5pError } from '@lumieducation/h5p-server';
import { deleteDynamoDBItem, getDynamoDBItem, setDynamoDBItem } from '@server/aws/dynamodb';

const DATA_PREFIX = `H5P_Data_`;

export class KeyValueStorage implements IKeyValueStorage {
    public async load(key: string): Promise<unknown> {
        try {
            return await getDynamoDBItem(`${DATA_PREFIX}${key}`);
        } catch (error) {
            console.error(error);
            throw new H5pError('key-value-storage:load', { key }, 500);
        }
    }
    public async save(key: string, value: unknown): Promise<void> {
        try {
            await setDynamoDBItem(`${DATA_PREFIX}${key}`, value);
        } catch (error) {
            console.error(error);
            throw new H5pError('key-value-storage:save', { key }, 500);
        }
    }
    public async delete(key: string): Promise<void> {
        try {
            await deleteDynamoDBItem(`${DATA_PREFIX}${key}`);
        } catch (error) {
            console.error(error);
            throw new H5pError('key-value-storage:delete', { key }, 500);
        }
    }
}
