'use server';

import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import { classrooms } from '@server/database/schemas/classrooms';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export const deleteMascot = async (activityId: number, classroomId: number): Promise<void> => {
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

    await db
        .update(classrooms)
        .set({ mascotteId: null, avatarUrl: null })
        .where(and(
            eq(classrooms.id, classroomId),
            eq(classrooms.teacherId, user.id)
        )
    );

    revalidatePath('/my-activities'); // refresh the my-activities page
};
