'use server';

import { db } from '@server/database';
import type { Activity } from '@server/database/schemas/activities';
import { activities } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
import { ACTIVITY_TYPES_ENUM } from '@server/database/schemas/activity-types';
import { eq } from 'drizzle-orm';

type DbActivity = typeof activities.$inferSelect;

function isValidActivityType(type: string): type is ActivityType {
    return ACTIVITY_TYPES_ENUM.includes(type as ActivityType);
}

function mapToActivity(dbActivity: DbActivity): Activity {
    if (!isValidActivityType(dbActivity.type)) {
        throw new Error(`Unknown activity type: ${dbActivity.type}`);
    }
    // The cast is unavoidable: Drizzle infers `data` as `unknown` (jsonb column)
    // while Activity expects a typed discriminated union. The type guard above
    // ensures `type` is valid; `data` shape is trusted from the DB.
    return dbActivity as unknown as Activity;
}

export async function getActivity(activityId: number): Promise<Activity | null> {
    const dbActivity: DbActivity | undefined = await db.query.activities.findFirst({
        where: eq(activities.id, activityId),
    });

    if (!dbActivity) return null;

    return mapToActivity(dbActivity);
}
