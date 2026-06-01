'use server';

import { db } from '@server/database';
import { activities, type Activity } from '@server/database/schemas/activities';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { and, eq, isNotNull, sql } from 'drizzle-orm';

export const updateActivityClassroomViews = async (activity: Activity): Promise<void> => {
    const user = await getCurrentUser();
    if (!user || user.role === 'admin' || user.role === 'mediator') {
        return;
    }

    const { classroom } = await getCurrentVillageAndClassroomForUser(user);
    if (!classroom?.id || activity.classroomId === classroom.id || activity.views?.includes(classroom.id)) {
        return;
    }

    await db
        .update(activities)
        .set({ views: sql`array_append(${activities.views}, ${classroom.id})` })
        .where(and(eq(activities.id, activity.id), isNotNull(activities.publishDate), sql`NOT (${classroom.id} = ANY(${activities.views}))`));
};
