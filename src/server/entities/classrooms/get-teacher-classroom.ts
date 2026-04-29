import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { and, eq } from 'drizzle-orm';

export const getTeacherClassroom = async (userId: string, classroomId?: number) => {
    const filters = classroomId ? and(eq(classrooms.id, classroomId), eq(classrooms.teacherId, userId)) : eq(classrooms.teacherId, userId);

    const classroom = await db.query.classrooms.findFirst({
        where: filters,
    });
    return classroom;
};
