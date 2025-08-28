'use server';

import { db } from '@server/database';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';

interface CreateVillageArgs {
    name: string;
    countries: string[];
    classroomCount?: Record<string, number>;
}

export const createVillage = async ({ name, countries, classroomCount: initialClassroomCount = {} }: CreateVillageArgs): Promise<void> => {
    const currentUser = await getCurrentUser();

    if (currentUser?.role !== 'admin') {
        throw new Error('Not authorized');
    }

    // Number of classrooms per country
    const classroomCount = countries.reduce<Record<string, number>>((acc, country) => {
        if (initialClassroomCount[country]) {
            acc[country] = initialClassroomCount[country];
        } else {
            acc[country] = 0;
        }
        return acc;
    }, {});

    await db.insert(villages).values({
        name,
        countries,
        activePhase: 1,
        phaseStartDates: { 1: new Date().toISOString() },
        classroomCount,
    });
};
