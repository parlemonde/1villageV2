'use server';

import { db } from '@server/database';
import type { Comment } from '@server/database/schemas/comments';
import { comments } from '@server/database/schemas/comments';
import { getCurrentUser } from '@server/helpers/get-current-user';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { eq, sql } from 'drizzle-orm';
import { getExtracted } from 'next-intl/server';

export const updateComment = async (comment: Partial<Comment>): Promise<ServerActionResponse> => {
    const t = await getExtracted('common');
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new Error('Unauthorized');
        }

        const { id, content } = comment;
        if (!id) {
            throw new Error('Comment ID is required to update comment');
        }

        await db
            .update(comments)
            .set({ content, updateDate: sql`now()` })
            .where(eq(comments.id, id));
        return {};
    } catch (e) {
        console.error(e);
        return { error: { message: t('Une erreur est survenue lors de la modification du commentaire.') } };
    }
};
