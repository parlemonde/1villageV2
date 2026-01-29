'use server';

import { db } from '@server/database';
import type { Activity } from '@server/database/schemas/activities';
import { activities } from '@server/database/schemas/activities';
import { eq } from 'drizzle-orm';

export async function getPelicoPresentation() {
    const result = await db.select().from(activities).where(eq(activities.type, 'presentation-pelico')).limit(1);

    if (result.length === 0) {
        return null;
    }

    return result[0] as Activity;
}
