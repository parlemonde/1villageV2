'use server';

import { db } from '@server/database';
import type { ActivityReaction } from '@server/database/schemas/activity-reactions';
import { activityReactions } from '@server/database/schemas/activity-reactions';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { logger } from '@server/lib/logger';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { getExtracted } from 'next-intl/server';

export const postReaction = async ({
    activityId,
    classroomId,
    userId,
    reaction,
}: {
    activityId: number;
    classroomId?: number;
    userId?: string;
    reaction: string;
}): Promise<ServerActionResponse<ActivityReaction>> => {
    const t = await getExtracted('common');

    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        if (!classroomId && !userId) {
            throw new Error('Either classroomId or userId is required');
        }

        const [data] = await db
            .insert(activityReactions)
            .values({ activityId, classroomId, userId, reaction: reaction })
            .onConflictDoUpdate({
                target: [activityReactions.activityId, activityReactions.classroomId, activityReactions.userId],
                set: { reaction: reaction },
            })
            .returning();

        return { data };
    } catch (e) {
        logger.error(e);
        return { error: { message: t('Une erreur est survenue lors de la publication de votre réaction.') } };
    }
};
