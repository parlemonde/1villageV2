import type { IKeyValueStorage } from '@lumieducation/h5p-server';
import { H5pError } from '@lumieducation/h5p-server';
import { db } from '@server/database';
import { h5pKeyValue } from '@server/database/schemas/h5p';
import { eq } from 'drizzle-orm';

export class KeyValueStorage implements IKeyValueStorage {
    public async load(key: string): Promise<unknown> {
        try {
            const row = await db.select({ value: h5pKeyValue.value }).from(h5pKeyValue).where(eq(h5pKeyValue.key, key)).limit(1);
            return row[0]?.value;
        } catch (_error) {
            throw new H5pError('key-value-storage:load', { key }, 500);
        }
    }

    public async save(key: string, value: unknown): Promise<void> {
        try {
            await db.insert(h5pKeyValue).values({ key, value }).onConflictDoUpdate({ target: h5pKeyValue.key, set: { value } });
        } catch (_error) {
            throw new H5pError('key-value-storage:save', { key }, 500);
        }
    }

    public async delete(key: string): Promise<void> {
        try {
            await db.delete(h5pKeyValue).where(eq(h5pKeyValue.key, key));
        } catch (_error) {
            throw new H5pError('key-value-storage:delete', { key }, 500);
        }
    }
}
