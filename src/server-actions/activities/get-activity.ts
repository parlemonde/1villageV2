'use server';

import { db } from '@server/database';
import { activities, type Activity } from '@server/database/schemas/activities';
import type { ReactionActivityDao } from '@server/database/schemas/activity-types';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';

export const getActivity = async (id: number | null): Promise<Activity | undefined> => {
    if (!id) {
        return undefined;
    }

    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const activity = (await db.query.activities.findFirst({
        where: and(eq(activities.id, id), isNotNull(activities.publishDate)),
    })) as Activity | undefined;

    if (!activity) {
        return undefined;
    }

    if (activity.type === 'reaction') {
        const reaction = activity as ReactionActivityDao;
        if (reaction.data.activityId) {
            const activityBeingReacted = (await db.query.activities.findFirst({
                where: and(isNull(activities.deleteDate), eq(activities.id, reaction.data.activityId)),
            })) as Activity | undefined;
            return { ...activity, data: { ...activity.data, activityBeingReacted } };
        }
    }

    return activity;
};
