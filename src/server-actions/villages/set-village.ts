'use server';

import { getVillage } from '@server/entities/villages/get-village';
import { cookies } from 'next/headers';

export const setVillage = async (villageId: number): Promise<void> => {
    const village = await getVillage(villageId);
    if (!village) {
        throw new Error(`Village ${villageId} not found`);
    }

    const cookieStore = await cookies();
    // This is a session cookie: it has no expiration date or max-age, so it will be deleted when the user closes the browser.
    cookieStore.set('villageId', villageId.toString());
};
