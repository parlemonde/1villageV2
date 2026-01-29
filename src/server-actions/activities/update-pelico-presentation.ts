'use server';

import type { AnyContent } from '@frontend/components/content/content.types';
import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updatePelicoPresentation(
    data: {
        title?: string;
        text?: string;
        content?: AnyContent[];
    } | null,
) {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const existing = await db.select().from(activities).where(eq(activities.type, 'presentation-pelico')).limit(1);

    if (existing.length === 0) {
        await db.insert(activities).values({
            type: 'presentation-pelico',
            data: data,
            userId: user.id,
            phase: 1, // ?
            isPelico: true,
            isPinned: false,
        });
    } else {
        await db
            .update(activities)
            .set({
                data: data,
            })
            .where(eq(activities.type, 'presentation-pelico'));
    }

    revalidatePath('/admin/newportal/manage/settings');
    revalidatePath('/admin/newportal/manage/pelico');
}
