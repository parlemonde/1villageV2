'use server';

import { db } from '@server/database';
import type { Activity } from '@server/database/schemas/activities';
import { activities } from '@server/database/schemas/activities';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq, sql } from 'drizzle-orm';

export const publishActivity = async (activity: Partial<Activity>) => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    if (activity.id) {
        const { id, ...rest } = activity; // no need to update id
        await db
            .update(activities)
            .set({
                ...rest,
                publishDate: sql`now()`,
            })
            .where(eq(activities.id, activity.id));
    } else {
        const { type, phase, ...rest } = activity;
        if (type === undefined || phase === undefined) {
            throw new Error('Type and phase are required');
        }
        await db.insert(activities).values([
            {
                ...rest,
                userId: user.id,
                type,
                phase,
                publishDate: sql`now()`,
            },
        ]);
    }
};
