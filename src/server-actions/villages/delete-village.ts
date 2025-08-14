'use server';

import { eq } from 'drizzle-orm';

import { db } from '@/database';
import { villages } from '@/database/schemas/villages';
import { getCurrentUser } from '@/server-functions/getCurrentUser';

export const deleteVillage = async (villageId: number): Promise<void> => {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== 'admin') {
        throw new Error('Not authorized');
    }
    await db.delete(villages).where(eq(villages.id, villageId));
};
