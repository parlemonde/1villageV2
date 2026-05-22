'use server';

import { db } from '@server/database';
import { users } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { logger } from '@server/lib/logger';
import { eq } from 'drizzle-orm';

type SubscriptionUpdates = Partial<{
    adminPublication: boolean;
    commentActivity: boolean;
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

    const updateData: Record<string, boolean> = {};
    if (updates.adminPublication !== undefined) {
        updateData.adminPublicationSubscribed = updates.adminPublication;
    }
    if (updates.commentActivity !== undefined) {
        updateData.commentActivitySubscribed = updates.commentActivity;
    }

    if (Object.keys(updateData).length === 0) {
        return; // Nothing to update
    }

    try {
        await db
            .update(users)
            .set(updateData as any)
            .where(eq(users.id, user.id));
    } catch (error) {
        logger.error(error);
        throw new Error('Failed to update subscription preferences');
    }
};
