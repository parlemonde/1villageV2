import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import { eq } from 'drizzle-orm';

export const getActivity = async (activityId: number) => {
    const activity = await db.query.activities.findFirst({
        where: eq(activities.id, activityId),
    });
    return activity;
};
