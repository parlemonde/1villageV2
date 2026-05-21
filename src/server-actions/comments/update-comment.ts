'use server';

import { db } from '@server/database';
import type { Comment } from '@server/database/schemas/comments';
import { comments } from '@server/database/schemas/comments';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { logger } from '@server/lib/logger';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { and, or, eq, sql, isNull } from 'drizzle-orm';
import { getExtracted } from 'next-intl/server';

export const updateComment = async (comment: Partial<Comment>): Promise<ServerActionResponse> => {
    const t = await getExtracted('common');
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        const { classroom } = await getCurrentVillageAndClassroomForUser(user);
        const isPelico = user.role === 'admin' || user.role === 'mediator';

        if (!isPelico && !classroom) {
            throw new Error('Unauthorized');
        }

        // Wrong classroom for non-Pelico users
        if (!isPelico && comment.classroomId != null && comment.classroomId !== classroom!.id) {
            throw new Error('Unauthorized');
        }

        const { id, content } = comment;
        if (!id) {
            throw new Error('Comment ID is required to update comment');
        }

        const filters = isPelico
            ? and(eq(comments.id, id), eq(comments.userId, user.id))
            : and(eq(comments.id, id), eq(comments.userId, user.id), or(isNull(comments.classroomId), eq(comments.classroomId, classroom!.id)));

        await db
            .update(comments)
            .set({ content, updateDate: sql`now()` })
            .where(filters);
        return {};
    } catch (e) {
        logger.error(e);
        return { error: { message: t('Une erreur est survenue lors de la modification du commentaire.') } };
    }
};
