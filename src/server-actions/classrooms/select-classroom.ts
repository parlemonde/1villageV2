'use server';

import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

export const selectClassroom = async (classroomId: number): Promise<void> => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }
    if (user.role !== 'teacher') {
        throw new Error('Not authorized');
    }

    const village = await db
        .select()
        .from(classrooms)
        .where(and(eq(classrooms.id, classroomId), eq(classrooms.teacherId, user.id)));

    if (!village) {
        throw new Error(`Classroom ${classroomId} not found`);
    }

    const cookieStore = await cookies();
    cookieStore.set('classroomId', classroomId.toString());
};
