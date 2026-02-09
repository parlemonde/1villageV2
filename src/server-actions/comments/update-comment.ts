'use server';

import { db } from '@server/database';
import type { Comment } from '@server/database/schemas/comments';
import { comments } from '@server/database/schemas/comments';
import { getCurrentUser } from '@server/helpers/get-current-user';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { and, eq, sql } from 'drizzle-orm';
import { getExtracted } from 'next-intl/server';

export const updateComment = async (comment: Partial<Comment>): Promise<ServerActionResponse> => {
    const t = await getExtracted('common');
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        const { id, content } = comment;
        if (!id) {
            throw new Error('Comment ID is required to update comment');
        }

        await db
            .update(comments)
            .set({ content, updateDate: sql`now()` })
            .where(and(eq(comments.id, id), eq(comments.userId, user.id)));
        return {};
    } catch (e) {
        console.error(e);
        return { error: { message: t('Une erreur est survenue lors de la modification du commentaire.') } };
    }
};
