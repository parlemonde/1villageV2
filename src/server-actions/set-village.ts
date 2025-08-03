'use server';

import { cookies } from 'next/headers';

import { getVillage } from '@/server-functions/villages/getVillage';

export const setVillage = async (villageId: number): Promise<void> => {
    const village = await getVillage(villageId);
    if (!village) {
        throw new Error('Village not found');
    }

    const cookieStore = await cookies();
    // This is a session cookie: it has no expiration date or max-age, so it will be deleted when the user closes the browser.
    cookieStore.set('villageId', villageId.toString());
};
