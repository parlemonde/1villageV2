'use server';

import { db } from '@server/database';
import { activityReactions } from '@server/database/schemas/activity-reactions';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { logger } from '@server/lib/logger';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { and, eq } from 'drizzle-orm';
import { getExtracted } from 'next-intl/server';

export const deleteReaction = async (activityId: number): Promise<ServerActionResponse> => {
    const t = await getExtracted('common');
    try {
        const user = await getCurrentUser();

        if (!user) {
            throw new Error('Unauthorized');
        }

        const { classroom } = await getCurrentVillageAndClassroomForUser(user);

        const conditions = [eq(activityReactions.activityId, activityId)];

        if (classroom?.id !== undefined) {
            conditions.push(eq(activityReactions.classroomId, classroom.id));
        }
        if (user.id !== undefined) {
            conditions.push(eq(activityReactions.userId, user.id));
        }

        await db.delete(activityReactions).where(and(...conditions));

        return {};
    } catch (e) {
        logger.error(e);
        return {
            error: { message: t('Une erreur est survenue lors de la suppression de votre réaction') },
        };
    }
};
