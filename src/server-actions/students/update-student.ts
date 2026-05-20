'use server';

import { db } from '@server/database';
import { students } from '@server/database/schemas/students';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { logger } from '@server/lib/logger';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { and, eq } from 'drizzle-orm';

export const updateStudent = async (studentId: number, studentName: string): Promise<ServerActionResponse> => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        const { classroom } = await getCurrentVillageAndClassroomForUser(user);
        if (!classroom) {
            throw new Error("Teacher doesn't have a classroom");
        }

        await db
            .update(students)
            .set({ name: studentName })
            .where(and(eq(students.id, studentId), eq(students.teacherId, user.id), eq(students.classroomId, classroom.id)));

        return {};
    } catch (e) {
        logger.error(e);
        return { error: { message: "Une erreur est survenue lors de la modification de l'enfant" } };
    }
};
