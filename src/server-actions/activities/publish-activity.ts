'use server';

import { db } from '@server/database';
import type { Activity } from '@server/database/schemas/activities';
import { activities } from '@server/database/schemas/activities';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';

export const publishActivity = async (activity: Partial<Activity>) => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    if (!activity.id) {
        const { type, phase, ...rest } = activity;
        if (type === undefined || phase === undefined) {
            throw new Error('Type and phase are required');
        }
        await db.insert(activities).values([
            {
                ...rest,
                type,
                phase,
                publishDate: new Date().toISOString(),
            },
        ]);
    } else {
        await db
            .update(activities)
            .set({
                ...activity,
                publishDate: new Date().toISOString(),
            })
            .where(eq(activities.id, activity.id));
    }
};
