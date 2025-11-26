'use server';

import { db } from '@server/database';
import { users } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';

export const updateUserName = async (newName: string) => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error('Non autorisé');
    }

    if (!newName || newName.trim().length === 0) {
        throw new Error('Le nom ne peut pas être vide');
    }

    await db.update(users).set({ name: newName.trim(), updatedAt: new Date() }).where(eq(users.id, currentUser.id));

    return { ...currentUser, name: newName.trim() };
};
