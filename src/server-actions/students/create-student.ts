'use server';

import { db } from '@server/database';
import { students } from '@server/database/schemas/students';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { generateInviteCode } from '@server-actions/families/generate-invite-code';

export const createStudent = async (studentName: string) => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const { classroom } = await getCurrentVillageAndClassroomForUser(user);
    if (!classroom) {
        throw new Error("Teacher doesn't have a classroom");
    }

    await db.insert(students).values({
        name: studentName,
        classroomId: classroom.id,
        teacherId: user.id,
        inviteCode: generateInviteCode(),
    });
};
