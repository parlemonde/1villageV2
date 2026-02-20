'use server';

import type { ActivityVisibilityForm } from '@frontend/contexts/familyContext';
import { db } from '@server/database';
import { activityVisibility } from '@server/database/schemas/activity-visibility';
import { classrooms } from '@server/database/schemas/classrooms';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import type { SQL } from 'drizzle-orm';
import { eq, inArray, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export const saveActivityVisibility = async ({ showOnlyClassroomActivities, activityVisibilityMap }: Partial<ActivityVisibilityForm>) => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const { classroom } = await getCurrentVillageAndClassroomForUser(user);
    if (!classroom) {
        throw new Error("Teacher doesn't have a classroom");
    }

    if (showOnlyClassroomActivities !== undefined) {
        await db.update(classrooms).set({ showOnlyClassroomActivities }).where(eq(classrooms.id, classroom.id));
        revalidatePath('/familles/1');
    }

    if (activityVisibilityMap) {
        const sqlChunks: SQL[] = [];
        const ids: number[] = [];

        sqlChunks.push(sql`(case`);
        for (const [id, isHidden] of Object.entries(activityVisibilityMap)) {
            sqlChunks.push(sql`when ${activityVisibility.activityId} = ${id} then ${isHidden}`);
            ids.push(parseInt(id));
        }

        sqlChunks.push(sql`end)`);

        const finalSql: SQL = sql.join(sqlChunks, sql.raw(' '));
        await db.update(activityVisibility).set({ isHidden: finalSql }).where(inArray(activityVisibility.activityId, ids));
    }
};
