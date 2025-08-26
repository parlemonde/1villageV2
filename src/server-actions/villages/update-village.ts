'use server';

import { eq } from 'drizzle-orm';

import { db } from '@/database';
import { villages } from '@/database/schemas/villages';
import { getCurrentUser } from '@/server-functions/getCurrentUser';

interface UpdateVillageArgs {
    id: number;
    name: string;
    countries: string[];
    classroomCount?: Record<string, number>;
}

export const updateVillage = async ({ id, name, countries, classroomCount: updatedClassroomCount = {} }: UpdateVillageArgs): Promise<void> => {
    const currentUser = await getCurrentUser();

    if (currentUser?.role !== 'admin') {
        throw new Error('Not authorized');
    }

    const classroomCount = updatedClassroomCount
        ? countries.reduce<Record<string, number>>((acc, country) => {
              if (updatedClassroomCount[country]) {
                  acc[country] = updatedClassroomCount[country];
              } else {
                  acc[country] = 0;
              }
              return acc;
          }, {})
        : undefined;

    await db
        .update(villages)
        .set({
            name,
            countries,
            classroomCount,
        })
        .where(eq(villages.id, id));
};
