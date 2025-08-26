'use server';

import { db } from '@/database';
import { villages } from '@/database/schemas/villages';
import { getCurrentUser } from '@/server-functions/getCurrentUser';

interface CreateVillageArgs {
    name: string;
    countries: string[];
}
export const createVillage = async ({ name, countries }: CreateVillageArgs): Promise<void> => {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== 'admin') {
        throw new Error('Not authorized');
    }

    await db.insert(villages).values({
        name,
        countries,
        activePhase: 1,
        phaseStartDates: { 1: new Date().toISOString() },
    });
};
