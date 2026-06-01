import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { parentsStudents } from '@server/database/schemas/parents-students';
import { students } from '@server/database/schemas/students';
import { eq } from 'drizzle-orm';

export const getStudentClassroom = async (parentId: string) => {
    const [row] = await db
        .select()
        .from(parentsStudents)
        .innerJoin(students, eq(parentsStudents.studentId, students.id))
        .innerJoin(classrooms, eq(students.classroomId, classrooms.id))
        .where(eq(parentsStudents.parentId, parentId))
        .limit(1);

    return row?.classrooms;
};
