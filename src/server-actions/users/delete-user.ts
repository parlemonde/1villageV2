'use server';

import { eq } from 'drizzle-orm';

import { db } from '@/database';
import { users } from '@/database/schemas/users';
import { getCurrentUser } from '@/server-functions/getCurrentUser';

export const deleteUser = async (userId: number): Promise<void> => {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== 'admin') {
        throw new Error('Not authorized');
    }
    await db.delete(users).where(eq(users.id, userId));
};
