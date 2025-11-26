'use server';

import { db } from '@server/database';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq, inArray } from 'drizzle-orm';

export const updatePhases = async (phases: Partial<Record<string, number>>): Promise<void> => {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== 'admin') {
        throw new Error('Not authorized');
    }

    const villagesToUpdate = await db
        .select()
        .from(villages)
        .where(inArray(villages.id, Object.keys(phases).map(Number)));
    await db.transaction(async (tx) => {
        for (const village of villagesToUpdate) {
            const newPhase = phases[village.id];
            if (!newPhase || village.activePhase >= newPhase) {
                // Skip if the village is already at the desired phase
                continue;
            }
            const newPhaseStartDate = new Date().toISOString();
            const newPhaseStartDates = { ...village.phaseStartDates };
            for (let i = village.activePhase + 1; i <= newPhase; i++) {
                newPhaseStartDates[i] = newPhaseStartDate;
            }
            await tx
                .update(villages)
                .set({
                    activePhase: phases[village.id],
                    phaseStartDates: newPhaseStartDates,
                })
                .where(eq(villages.id, village.id));
        }
    });
};
