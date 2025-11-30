'use server';

import { db } from '@server/database';
import { phaseActivityTypes, type PhaseActivityType } from '@server/database/schemas/activity-types';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export const setActivityPhases = async (phases: PhaseActivityType[]): Promise<void> => {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== 'admin') {
        throw new Error('Not authorized');
    }

    const existingPhases = new Set(
        (
            await db
                .select()
                .from(phaseActivityTypes)
                .where(
                    inArray(
                        phaseActivityTypes.phase,
                        phases.map((phase) => phase.phase),
                    ),
                )
        ).map((phase) => phase.phase),
    );
    const phasesToInsert = phases.filter((phase) => !existingPhases.has(phase.phase));
    const phasesToUpdate = phases.filter((phase) => existingPhases.has(phase.phase));
    await db.transaction(async (tx) => {
        if (phasesToInsert.length > 0) {
            await tx.insert(phaseActivityTypes).values(phasesToInsert);
        }
        if (phasesToUpdate.length > 0) {
            for (const phase of phasesToUpdate) {
                await tx.update(phaseActivityTypes).set({ activityTypes: phase.activityTypes }).where(eq(phaseActivityTypes.phase, phase.phase));
            }
        }
    });

    revalidatePath('/admin/manage/activities');
};
