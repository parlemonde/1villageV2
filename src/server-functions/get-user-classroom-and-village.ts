import { eq } from 'drizzle-orm';

import { db } from '@/database';
import type { Classroom } from '@/database/schemas/classrooms';
import { classrooms } from '@/database/schemas/classrooms';
import type { Village } from '@/database/schemas/villages';
import { villages } from '@/database/schemas/villages';

export const getUserClassroomAndVillage = async (
    userId: number,
): Promise<{
    classroom: Classroom | undefined;
    village: Village | undefined;
}> => {
    const classroom = await db.query.classrooms.findFirst({
        where: eq(classrooms.teacherId, userId),
    });
    if (!classroom) {
        return {
            classroom: undefined,
            village: undefined,
        };
    }
    const village = await db.query.villages.findFirst({
        where: eq(villages.id, classroom.villageId),
    });
    return { classroom, village };
};
