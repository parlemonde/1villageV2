'use server';

import { getCurrentUser } from '@server/helpers/get-current-user';
import { auth } from '@server/lib/auth';
import { logger } from '@server/lib/logger';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { isAPIError } from 'better-auth/api';
import { headers } from 'next/headers';
import { getExtracted } from 'next-intl/server';

export const updateFirstLogin = async (firstLogin: number): Promise<ServerActionResponse> => {
    const t = await getExtracted('common');

    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        const data = await auth.api.updateUser({
            body: {
                firstLogin: firstLogin,
            },
            headers: await headers(),
        });

        return !data.status ? { error: { message: t('Une erreur est survenue lors de la mise à jour du statut de connexion') } } : {};
    } catch (e) {
        if (isAPIError(e)) {
            logger.error(e);
        }
        return { error: { message: t('Une erreur est survenue lors de la mise à jour du statut de connexion') } };
    }
};
