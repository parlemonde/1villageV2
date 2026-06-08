'use server';

import { getCurrentUser } from '@server/helpers/get-current-user';
import { auth, refreshSessionData } from '@server/lib/auth';
import { logger } from '@server/lib/logger';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getExtracted } from 'next-intl/server';

type SubscriptionUpdates = Partial<{
    adminPublicationSubscribed: boolean;
    commentActivitySubscribed: boolean;
}>;

export const updateSubscription = async (updates: SubscriptionUpdates): Promise<ServerActionResponse> => {
    const user = await getCurrentUser();
    const t = await getExtracted('common');

    if (!user) {
        throw new Error('Unauthorized');
    }

    // Only teachers can manage notification preferences
    if (user.role !== 'teacher') {
        throw new Error('Forbidden');
    }

    if (Object.keys(updates).length === 0) {
        return {}; // Nothing to update
    }

    try {
        await auth.api.updateUser({
            body: updates,
            headers: await headers(),
        });
        await refreshSessionData();
        revalidatePath('/(1village)/mon-compte/preferences');
        return {};
    } catch (error) {
        logger.error('Error while updating user preferences', { error });
        return { error: { message: t('Erreur lors de la mise à jour de vos préférences') } };
    }
};
