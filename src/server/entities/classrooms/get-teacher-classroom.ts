import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { eq } from 'drizzle-orm';

export const getTeacherClassroom = async (userId: number) => {
    const classroom = await db.query.classrooms.findFirst({
        where: eq(classrooms.teacherId, userId),
    });
    return classroom;
};
