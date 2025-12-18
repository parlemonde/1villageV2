'use server';

import { db } from '@server/database';
import type { Activity } from '@server/database/schemas/activities';
import { activities } from '@server/database/schemas/activities';
import type { FreeActivity, GameActivity, PuzzleActivity } from '@server/database/schemas/activity-types';
import { eq } from 'drizzle-orm';

function mapToActivity(raw: Activity | null): Activity | null {
    if (!raw) return null;

    switch (raw.type) {
        case 'libre':
            return {
                ...raw,
                type: 'libre',
                data: raw.data as FreeActivity['data'],
            };
        case 'jeu':
            return {
                ...raw,
                type: 'jeu',
                data: raw.data as GameActivity['data'],
            };
        case 'enigme':
            return {
                ...raw,
                type: 'enigme',
                data: raw.data as PuzzleActivity['data'],
            };
        default:
            return null;
    }
}

export async function getActivity(activityId: number): Promise<Activity | null> {
    const activity = await db.query.activities.findFirst({
        where: eq(activities.id, activityId),
    });

    return mapToActivity(activity);
}
