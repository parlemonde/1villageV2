'use server';

import { db } from '@server/database';
import type { Activity } from '@server/database/schemas/activities';
import { activities } from '@server/database/schemas/activities';
import type { QuestionActivity } from '@server/database/schemas/activity-types';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq, isNotNull } from 'drizzle-orm';

export const askSameQuestion = async (activity: Partial<Activity & QuestionActivity>) => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const { id: activityId, data, classroomId } = activity;
    if (!activityId) {
        throw new Error('Activity ID is required to ask question');
    }
    if (!classroomId) {
        throw new Error('Classroom ID is required to ask question');
    }

    const classroomSet = new Set(data?.isAskingSameQuestion || []);
    if (classroomSet.has(classroomId)) {
        classroomSet.delete(classroomId);
    } else {
        classroomSet.add(classroomId);
    }

    const newData = {
        ...data,
        isAskingSameQuestion: classroomSet.size > 0 ? [...classroomSet] : null,
    };

    await db
        .update(activities)
        .set({ data: newData })
        .where(and(eq(activities.id, activityId), isNotNull(activities.publishDate)));
};
