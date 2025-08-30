'use server';

import { getVillage } from '@server/entities/villages/get-village';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const setVillage = async (villageId: number): Promise<void> => {
    const village = await getVillage(villageId);
    if (!village) {
        throw new Error('Village not found');
    }

    const cookieStore = await cookies();
    // This is a session cookie: it has no expiration date or max-age, so it will be deleted when the user closes the browser.
    cookieStore.set('villageId', villageId.toString());
    redirect('/');
};
