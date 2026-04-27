'use server';

import { db } from '@server/database';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq, inArray } from 'drizzle-orm';

export const updateCrossVisibility = async (villagesCrossVisibility: Partial<Record<string, boolean>>): Promise<void> => {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== 'admin') {
        throw new Error('Not authorized');
    }

    const villageIds = Object.keys(villagesCrossVisibility).map(Number);
    if (villageIds.length === 0) {
        return;
    }

    const villagesToUpdate = await db.select().from(villages).where(inArray(villages.id, villageIds));
    await db.transaction(async (tx) => {
        for (const village of villagesToUpdate) {
            const desired = villagesCrossVisibility[village.id];
            // Action irreversible: only allow flipping false -> true.
            if (desired !== true || village.isCrossVisible) {
                continue;
            }
            await tx.update(villages).set({ isCrossVisible: true }).where(eq(villages.id, village.id));
        }
    });
};
