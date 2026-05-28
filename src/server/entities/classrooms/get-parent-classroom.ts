import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { parentsStudents } from '@server/database/schemas/parents-students';
import { students } from '@server/database/schemas/students';
import { eq } from 'drizzle-orm';

export const getParentClassroom = async (userId: string) => {
    const row = await db
        .select({
            classroomId: students.classroomId,
        })
        .from(parentsStudents)
        .innerJoin(students, eq(parentsStudents.studentId, students.id))
        .where(eq(parentsStudents.parentId, userId))
        .limit(1);

    if (row.length === 0) return undefined;

    return db.query.classrooms.findFirst({
        where: eq(classrooms.id, row[0].classroomId),
    });
};
