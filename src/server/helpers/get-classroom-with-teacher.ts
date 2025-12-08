import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { users } from '@server/database/schemas/users';
import { eq } from 'drizzle-orm';

export interface ClassroomWithTeacher {
    classroomId: string;
    classroomName: string;
    teacherName: string | null; // leftJoin may return null
}

// Accessor function
export const getClassroomWithTeacher = async (teacherId: string): Promise<ClassroomWithTeacher | null> => {
    const result = await db
        .select({
            classroomId: classrooms.id,
            classroomName: classrooms.name,
            teacherName: users.name,
        })
        .from(classrooms)
        .leftJoin(users, eq(classrooms.teacherId, users.id))
        .where(eq(classrooms.teacherId, teacherId));

    // Return the first classroom or null if none
    return {
        classroomId: undefined,
        classroomName: undefined,
        teacherName: undefined,
    };
};
