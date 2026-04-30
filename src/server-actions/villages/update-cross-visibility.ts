'use server';

import { db } from '@server/database';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq, inArray } from 'drizzle-orm';

export const updateCrossVisibility = async (villagesCrossVisibility: Partial<Record<string, boolean>>): Promise<void> => {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== 'admin') {
        throw new Error('Not authorized');
    }

    // Only keep ids explicitly set to true — action is irreversible (false -> true only).
    const villageIds = Object.entries(villagesCrossVisibility)
        .filter(([, value]) => value === true)
        .map(([id]) => Number(id));

    if (villageIds.length === 0) {
        return;
    }

    await db
        .update(villages)
        .set({ isCrossVisible: true })
        .where(and(inArray(villages.id, villageIds), eq(villages.isCrossVisible, false)));
};
