'use server';

import type { ParentInvitationMessageForm } from '@frontend/contexts/familyContext';
import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { eq } from 'drizzle-orm';

export const saveParentInvitationMessage = async ({ parentInvitationMessage }: Partial<ParentInvitationMessageForm>) => {
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
            parentInvitationMessage,
        })
        .where(eq(classrooms.id, classroom.id));
};
