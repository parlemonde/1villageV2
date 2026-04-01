'use server';

import { db } from '@server/database';
import { activityReactions } from '@server/database/schemas/activity-reactions';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { logger } from '@server/lib/logger';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { and, eq } from 'drizzle-orm';
import { getExtracted } from 'next-intl/server';

export const deleteReaction = async (activityId: number, classroomId?: number, userId?: string): Promise<ServerActionResponse> => {
    const t = await getExtracted('common');
    try {
        const user = await getCurrentUser();
        if (!user || user.id !== userId) {
            throw new Error('Unauthorized delete reaction for this user');
        }

        const { classroom } = await getCurrentVillageAndClassroomForUser(user);
        if (classroom && classroom.id !== classroomId) {
            throw new Error('Unauthorized delete reaction for this classroom');
        }

        if (!classroomId && !userId) {
            throw new Error('Either classroomId or userId is required');
        }

        const conditions = [eq(activityReactions.activityId, activityId)];
        if (classroomId !== undefined) {
            conditions.push(eq(activityReactions.classroomId, classroomId));
        }
        if (userId !== undefined) {
            conditions.push(eq(activityReactions.userId, userId));
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
