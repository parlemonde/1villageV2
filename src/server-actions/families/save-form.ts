'use server';

import type { FamilyForm } from '@frontend/contexts/familyContext';
import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { eq } from 'drizzle-orm';

export const saveForm = async ({ showOnlyClassroomActivities, students, hiddenActivities }: Partial<FamilyForm>) => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const { classroom } = await getCurrentVillageAndClassroomForUser(user);
    if (!classroom) {
        throw new Error("Teacher doesn't have a classroom");
    }

    await db
        .update(classrooms)
        .set({
            showOnlyClassroomActivities,
        })
        .where(eq(classrooms.id, classroom.id));
};
