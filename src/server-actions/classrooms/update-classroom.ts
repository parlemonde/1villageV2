'use server';

import { db } from '@server/database';
import { classrooms, type Classroom } from '@server/database/schemas/classrooms';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { logger } from '@server/lib/logger';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { and, eq } from 'drizzle-orm';

export const updateClassroom = async (classroom: Partial<Classroom>): Promise<ServerActionResponse<Classroom[]>> => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        // remove id, teacherId, villageId from ...rest for non-admin users (teachers)
        const { id: classroomId, teacherId, villageId, ...rest } = classroom;
        const updateData = user.role === 'admin' ? { ...rest, teacherId, villageId } : rest;

        if (!classroomId) {
            throw new Error('Classroom ID is required to update classroom');
        }

        return {
            data: await db
                .update(classrooms)
                .set(updateData)
                .where(and(eq(classrooms.id, classroomId), eq(classrooms.teacherId, user.id)))
                .returning(),
        };
    } catch (e) {
        logger.error(e);
        return { error: { message: 'Une erreur est survenue lors de la modification de la classe' } };
    }
};
