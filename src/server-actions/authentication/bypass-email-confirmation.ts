'use server';

import { db } from '@server/database';
import { users } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';

export const bypassEmailConfirmation = async (userId: string) => {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Unauthorized');
    }
    await db.update(users).set({ emailVerified: true }).where(eq(users.id, userId));
};
