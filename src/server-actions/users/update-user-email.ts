'use server';

import { db } from '@server/database';
import { users } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';

export const updateUserEmail = async (newEmail: string) => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error('Non autorisé');
    }

    if (!newEmail || newEmail.trim().length === 0) {
        throw new Error("L'email ne peut pas être vide");
    }

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, newEmail.trim()),
    });

    if (existingUser && existingUser.id !== currentUser.id) {
        throw new Error('Cet email est déjà utilisé');
    }

    await db.update(users).set({ email: newEmail.trim(), updatedAt: new Date() }).where(eq(users.id, currentUser.id));

    return { ...currentUser, email: newEmail.trim() };
};
