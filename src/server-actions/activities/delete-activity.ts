'use server';

import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export const deleteActivity = async (activityId: number): Promise<void> => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    // Soft delete: set deleteDate instead of actually deleting
    await db
        .update(activities)
        .set({ deleteDate: sql`now()` })
        .where(
            and(
                eq(activities.id, activityId),
                eq(activities.userId, user.id), // Ensure user can only delete their own activities
            ),
        );

    revalidatePath('/my-activities'); // refresh the my-activities page
};
