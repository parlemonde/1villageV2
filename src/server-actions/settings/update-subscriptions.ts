'use server';

import { db } from '@server/database';
import { users } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { logger } from '@server/lib/logger';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { eq } from 'drizzle-orm';
import { getExtracted } from 'next-intl/server';

export const updateAdminPublicationSubscription = async (enabled: boolean): Promise<ServerActionResponse> => {
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

        await db.update(users).set({ adminPublicationSubscribed: enabled }).where(eq(users.id, user.id));

        return {};
    } catch (e) {
        logger.error(e);
        return { error: { message: t('Une erreur est survenue lors de la mise à jour de votre préférence.') } };
    }
};

export const updateCommentActivitySubscription = async (enabled: boolean): Promise<ServerActionResponse> => {
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

        await db.update(users).set({ commentActivitySubscribed: enabled }).where(eq(users.id, user.id));

        return {};
    } catch (e) {
        logger.error(e);
        return { error: { message: t('Une erreur est survenue lors de la mise à jour de votre préférence.') } };
    }
};
