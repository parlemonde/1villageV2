'use server';

import { db } from '@server/database';
import type { Activity } from '@server/database/schemas/activities';
import { activities } from '@server/database/schemas/activities';
import type {
    ChallengeActivity,
    FreeActivity,
    GameActivity,
    HintActivity,
    MascotActivity,
    PelicoPresentation,
    PuzzleActivity,
    ReportActivity,
} from '@server/database/schemas/activity-types';
import { eq } from 'drizzle-orm';

type DbActivity = typeof activities.$inferSelect;

function mapToActivity(dbActivity: DbActivity): Activity | null {
    if (!dbActivity) return null;

    switch (dbActivity.type) {
        case 'libre':
            return {
                ...dbActivity,
                type: 'libre',
                data: dbActivity.data as FreeActivity['data'],
            };
        case 'jeu':
            return {
                ...dbActivity,
                type: 'jeu',
                data: dbActivity.data as GameActivity['data'],
            };
        case 'enigme':
            return {
                ...dbActivity,
                type: 'enigme',
                data: dbActivity.data as PuzzleActivity['data'],
            };
        case 'indice':
            return {
                ...dbActivity,
                type: 'indice',
                data: dbActivity.data as HintActivity['data'],
            };
        case 'reportage':
            return {
                ...dbActivity,
                type: 'reportage',
                data: dbActivity.data as ReportActivity['data'],
            };
        case 'presentation-pelico':
            return {
                ...dbActivity,
                type: 'presentation-pelico',
                data: dbActivity.data as PelicoPresentation['data'],
            };
        case 'mascotte':
            return {
                ...dbActivity,
                type: 'mascotte',
                data: dbActivity.data as MascotActivity['data'],
            };
        case 'defi':
            return {
                ...dbActivity,
                type: 'defi',
                data: dbActivity.data as ChallengeActivity['data'],
            };
        default:
            throw new Error(`Unknown activity type: ${dbActivity.type}`);
    }
}

export async function getActivity(activityId: number): Promise<Activity | null> {
    const dbActivity: DbActivity | undefined = await db.query.activities.findFirst({
        where: eq(activities.id, activityId),
    });

    if (!dbActivity) return null;

    return mapToActivity(dbActivity);
}
