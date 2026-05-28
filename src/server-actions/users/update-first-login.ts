'use server';

import { db } from '@server/database';
import { users } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { logger } from '@server/lib/logger';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { eq } from 'drizzle-orm';

export const updateFirstLogin = async (firstLogin: number): Promise<ServerActionResponse> => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        await db.update(users).set({ firstLogin }).where(eq(users.id, user.id));

        return {};
    } catch (e) {
        logger.error(e);
        return { error: { message: 'Une erreur est survenue lors de la mise à jour du statut de connexion' } };
    }
};
