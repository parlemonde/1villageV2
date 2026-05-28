import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { students } from '@server/database/schemas/students';
import { eq } from 'drizzle-orm';

export const getParentClassroom = async (userId: string) => {
    const student = await db.query.students.findFirst({
        where: eq(students.parentId, userId),
    });
    if (!student) return undefined;

    return db.query.classrooms.findFirst({
        where: eq(classrooms.id, student.classroomId),
    });
};
