'use server';

import { COUNTRIES } from '@lib/iso-3166-countries-french';
import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { and, eq } from 'drizzle-orm';

interface CreateClassroomArgs {
    alias?: string;
    level?: string;
    schoolName: string;
    address: string;
    country: string;
    villageId: number;
    teacherId: string;
    coordinates: { latitude: number; longitude: number };
}

export const createClassroom = async (createClassroom: CreateClassroomArgs): Promise<ServerActionResponse> => {
    try {
        const currentUser = await getCurrentUser();

        if (currentUser?.role !== 'admin') {
            throw new Error('Unauthorized');
        }

        const [village] = await db.select().from(villages).where(eq(villages.id, createClassroom.villageId));
        if (!village.countries.includes(createClassroom.country)) {
            return {
                error: {
                    message: `Le village ${village.name} n'accepte pas les classes du pays '${COUNTRIES[createClassroom.country]}'`,
                },
            };
        }

        const classroomsCount = await db.$count(
            classrooms,
            and(eq(classrooms.villageId, createClassroom.villageId), eq(classrooms.countryCode, createClassroom.country)),
        );

        if (classroomsCount >= village.classroomCount[createClassroom.country]) {
            return {
                error: {
                    message: `Le village ${village.name} a atteint le nombre maximum de classes pour le pays '${COUNTRIES[createClassroom.country]}'`,
                },
            };
        }

        const alias = createClassroom.alias || `Les ${createClassroom.level} de ${createClassroom.schoolName}`;

        await db.insert(classrooms).values({
            alias,
            level: createClassroom.level,
            name: createClassroom.schoolName,
            address: createClassroom.address,
            countryCode: createClassroom.country,
            villageId: createClassroom.villageId,
            teacherId: createClassroom.teacherId,
            coordinates: createClassroom.coordinates,
        });

        return {};
    } catch (e) {
        console.error(e);
        return { error: { message: 'Une erreur est survenue lors de la création de la classe' } };
    }
};
