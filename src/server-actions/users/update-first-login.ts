'use server';

import { getCurrentUser } from '@server/helpers/get-current-user';
import { auth, refreshSessionData } from '@server/lib/auth';
import { logger } from '@server/lib/logger';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { headers } from 'next/headers';
import { getExtracted } from 'next-intl/server';

export const updateFirstLogin = async (firstLogin: number): Promise<ServerActionResponse> => {
    const t = await getExtracted('common');

    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        await auth.api.updateUser({
            body: {
                firstLogin: firstLogin,
            },
            headers: await headers(),
        });
        await refreshSessionData(); // clear session_data cookie in order to reset it with fresh information
        return {};
    } catch (error) {
        logger.error('Error while updating user login status', { error });
        return { error: { message: t('Une erreur est survenue lors de la mise à jour du statut de connexion') } };
    }
};
