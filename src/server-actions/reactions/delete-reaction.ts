'use server';

import { db } from '@server/database';
import { activityReactions } from '@server/database/schemas/activity-reactions';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { logger } from '@server/lib/logger';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { and, eq } from 'drizzle-orm';
import { getExtracted } from 'next-intl/server';

export const deleteReaction = async (activityId: number, classroomId: number): Promise<ServerActionResponse> => {
    const t = await getExtracted('common');
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Unauthorized');
        }
        await db.delete(activityReactions).where(and(eq(activityReactions.activityId, activityId), eq(activityReactions.classroomId, classroomId)));

        return {};
    } catch (e) {
        logger.error(e);
        return {
            error: { message: t('Une erreur est survenue lors de la suppression de votre réaction') },
        };
    }
};
