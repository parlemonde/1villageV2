'use server';

import { db } from '@server/database';
import type { Activity } from '@server/database/schemas/activities';
import { activities } from '@server/database/schemas/activities';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq, isNotNull } from 'drizzle-orm';

export const askSameQuestion = async (activity: Partial<Activity>) => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const { id: activityId, data } = activity;
    if (!activityId) {
        throw new Error('Activity ID is required to update activity');
    }

    await db
        .update(activities)
        .set({ data })
        .where(and(eq(activities.id, activityId), isNotNull(activities.publishDate)));
};
