import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { eq } from 'drizzle-orm';

export const getTeacherClassrooms = async (userId: string) => {
    return db.select().from(classrooms).where(eq(classrooms.teacherId, userId));
};
