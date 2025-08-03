import { eq } from 'drizzle-orm';

import { db } from '@/database';
import { classrooms } from '@/database/schemas/classrooms';

export const getTeacherClassroom = async (userId: number) => {
    const classroom = await db.query.classrooms.findFirst({
        where: eq(classrooms.teacherId, userId),
    });
    return classroom;
};
