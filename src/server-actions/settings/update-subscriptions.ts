'use server';

import { db } from '@server/database';
import { users } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { logger } from '@server/lib/logger';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { eq } from 'drizzle-orm';
import { getExtracted } from 'next-intl/server';

type subscriptionField = 'adminPublication' | 'commentActivity';

export const updateSubscription = async (field: subscriptionField, enabled: boolean): Promise<ServerActionResponse> => {
    const t = await getExtracted('common');
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        // Only teachers can manage notification preferences
        if (user.role !== 'teacher') {
            throw new Error('Forbidden');
        }
        switch (field) {
            case 'adminPublication':
                updateAdminPublicationSubscription(enabled, user.id);
                break;
            case 'commentActivity':
                updateCommentActivitySubscription(enabled, user.id);
                break;
            default:
                break;
        }
        return {};
    } catch (e) {
        logger.error(e);
        return { error: { message: t('Une erreur est survenue lors de la mise à jour de vos préférences.') } };
    }
};

export const updateAdminPublicationSubscription = async (enabled: boolean, userId: string): Promise<ServerActionResponse> => {
    const t = await getExtracted('common');
    try {
        await db.update(users).set({ adminPublicationSubscribed: enabled }).where(eq(users.id, userId));
        return {};
    } catch {
        return { error: { message: t('Une erreur est survenue lors de la mise à jour de votre préférence.') } };
    }
};

export const updateCommentActivitySubscription = async (enabled: boolean, userId: string): Promise<ServerActionResponse> => {
    const t = await getExtracted('common');
    try {
        await db.update(users).set({ commentActivitySubscribed: enabled }).where(eq(users.id, userId));
        return {};
    } catch {
        return { error: { message: t('Une erreur est survenue lors de la mise à jour de votre préférence.') } };
    }
};
