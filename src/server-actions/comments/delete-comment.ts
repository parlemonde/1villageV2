'use server';

import { db } from '@server/database';
import { comments } from '@server/database/schemas/comments';
import { getCurrentUser } from '@server/helpers/get-current-user';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { and, eq } from 'drizzle-orm';
import { getExtracted } from 'next-intl/server';

export const deleteComment = async (commentId: number): Promise<ServerActionResponse> => {
    const t = await getExtracted('common');
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        const isPelico = user.role === 'admin' || user.role === 'mediator';
        const filters = isPelico ? eq(comments.id, commentId) : and((eq(comments.id, commentId), eq(comments.userId, user.id)));

        await db.delete(comments).where(filters);
        return {};
    } catch (e) {
        console.error(e);
        return {
            error: { message: t('Une erreur est survenue lors de la suppression du commentaire') },
        };
    }
};
