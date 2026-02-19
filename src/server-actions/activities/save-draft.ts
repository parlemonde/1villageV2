'use server';

import { db } from '@server/database';
import type { Activity } from '@server/database/schemas/activities';
import { activities } from '@server/database/schemas/activities';
import { activityVisibility } from '@server/database/schemas/activity-visibility';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq, isNull } from 'drizzle-orm';

export const saveDraft = async (activity: Partial<Activity>): Promise<number> => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    if (activity.id) {
        const { id, ...rest } = activity; // no need to update id
        await db
            .update(activities)
            .set(rest)
            .where(and(eq(activities.id, id), isNull(activities.publishDate)));
        return id;
    } else {
        const { phase, type, ...rest } = activity;
        if (!phase || !type) {
            throw new Error('Phase and type are required');
        }

        if (!activity.classroomId) {
            throw new Error('Classroom id is required');
        }

        // Delete previous draft for same user and type if it exists
        await db.delete(activities).where(and(eq(activities.userId, user.id), isNull(activities.publishDate), eq(activities.type, type)));
        // Create new draft
        const results = await db
            .insert(activities)
            .values({
                ...rest,
                phase,
                type,
                userId: user.id,
            })
            .returning({
                id: activities.id,
            });

        const activityId = results[0].id;

        await db.insert(activityVisibility).values({
            activityId,
            teacherId: user.id,
            classroomId: activity.classroomId,
        });

        return activityId;
    }
};
