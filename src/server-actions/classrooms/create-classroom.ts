'use server';

import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq } from 'drizzle-orm';

interface CreateClassroomArgs {
    level?: string;
    schoolName: string;
    address: string;
    city: string;
    country: string;
    villageId: number;
    teacherId: string;
}

export const createClassroom = async (createClassroom: CreateClassroomArgs) => {
    const currentUser = await getCurrentUser();

    if (currentUser?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    const [village] = await db.select().from(villages).where(eq(villages.id, createClassroom.villageId));
    if (!village.countries.includes(createClassroom.country)) {
        throw new Error(`Village ${village.name} doesn't allow classroms from country ${createClassroom.country}`);
    }

    const classroomsCount = await db.$count(
        classrooms,
        and(eq(classrooms.villageId, createClassroom.villageId), eq(classrooms.countryCode, createClassroom.country)),
    );

    if (classroomsCount > village.classroomCount[createClassroom.country]) {
        const error = Error(`Village ${village.name} has reached the maximum number of classrooms for country ${createClassroom.country}`);
        error.name = 'MaxClassroomsError';
        throw error;
    }

    await db.insert(classrooms).values({
        level: createClassroom.level,
        name: createClassroom.schoolName,
        address: createClassroom.address,
        city: createClassroom.city,
        countryCode: createClassroom.country,
        villageId: createClassroom.villageId,
        teacherId: createClassroom.teacherId,
    });
};
