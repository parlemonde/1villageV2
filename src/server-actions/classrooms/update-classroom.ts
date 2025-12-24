'use server';

import { db } from '@server/database';
import { classrooms, type Classroom } from '@server/database/schemas/classrooms';
import { getCurrentUser } from '@server/helpers/get-current-user';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { and, eq } from 'drizzle-orm';

export const updateClassroom = async (classroom: Partial<Classroom>): Promise<ServerActionResponse<Classroom[]>> => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        const { id: classroomId, ...rest } = classroom;
        if (!classroomId) {
            throw new Error('Classroom ID is required to update classroom');
        }

        if (user.role === 'admin') {
            return { data: await db.update(classrooms).set(rest).where(eq(classrooms.id, classroomId)) };
        }

        return {
            data: await db
                .update(classrooms)
                .set(rest)
                .where(and(eq(classrooms.id, classroomId), eq(classrooms.teacherId, user.id)))
                .returning(),
        };
    } catch (e) {
        console.error(e);
        return { error: { message: 'Une erreur est survenue lors de la modification de la classe' } };
    }
};
