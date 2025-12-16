'use server';

import { db } from '@server/database';
import { classrooms, type Classroom } from '@server/database/schemas/classrooms';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq } from 'drizzle-orm';

export const updateClassroom = async (classroom: Partial<Classroom>): Promise<Classroom[]> => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const { id: classroomId, ...rest } = classroom;
    if (!classroomId) {
        throw new Error('Classroom ID is required to update classroom');
    }

    if (user.role === 'admin') {
        return await db.update(classrooms).set(rest).where(eq(classrooms.id, classroomId));
    }

    return await db
        .update(classrooms)
        .set(rest)
        .where(and(eq(classrooms.id, classroomId), eq(classrooms.teacherId, user.id)))
        .returning();
};
