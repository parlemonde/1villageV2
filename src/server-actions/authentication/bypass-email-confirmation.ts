'use server';

import { db } from '@server/database';
import { users } from '@server/database/schemas/users';
import { eq } from 'drizzle-orm';

export const bypassEmailConfirmation = async (userId: string) => {
    await db.update(users).set({ emailVerified: true }).where(eq(users.id, userId));
};
