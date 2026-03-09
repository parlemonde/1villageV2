'use server';

import { db } from '@server/database';
import type { Activity } from '@server/database/schemas/activities';
import { activities } from '@server/database/schemas/activities';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { and, eq, isNotNull } from 'drizzle-orm';

export const updateActivityViews = async (activity: Partial<Activity>) => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }
    const { classroom } = await getCurrentVillageAndClassroomForUser(user);
    if (!classroom) {
        throw new Error('No current Classroom found for updating activity views');
    }

    const { id: activityId, views } = activity;
    if (!activityId) {
        throw new Error('Activity ID is required to ask question');
    }

    if (views?.includes(classroom.id)) {
        return;
    }

    await db
        .update(activities)
        .set({ views: views?.push(classroom.id) })
        .where(and(eq(activities.id, activityId), isNotNull(activities.publishDate)));
};
