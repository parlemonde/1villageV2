'use server';

import { db } from '@server/database';
import { users } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { logger } from '@server/lib/logger';
import { eq } from 'drizzle-orm';

type SubscriptionUpdates = Partial<{
    adminPublicationSubscribed: boolean;
    commentActivitySubscribed: boolean;
}>;

export const updateSubscription = async (updates: SubscriptionUpdates): Promise<void> => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    // Only teachers can manage notification preferences
    if (user.role !== 'teacher') {
        throw new Error('Forbidden');
    }

    if (Object.keys(updates).length === 0) {
        return; // Nothing to update
    }

    try {
        await db.update(users).set(updates).where(eq(users.id, user.id));
    } catch (error) {
        logger.error(error);
        throw new Error('Failed to update subscription preferences');
    }
};
