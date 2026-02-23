'use server';
import { db } from '@server/database';
import { userPreferences } from '@server/database/schemas/user-preferences';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';

export const saveParentInvitationMessage = async (message: unknown) => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    await db.update(userPreferences).set({ parentInvitationMessage: message }).where(eq(userPreferences.userId, user.id));
};
