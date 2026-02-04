'use server';

import { db } from '@server/database';
import { comments } from '@server/database/schemas/comments';
import { getCurrentUser } from '@server/helpers/get-current-user';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { eq } from 'drizzle-orm';
import { getExtracted } from 'next-intl/server';

export const deleteComment = async (commentId: number): Promise<ServerActionResponse> => {
    const t = await getExtracted('common');
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            throw new Error('Unauthorized');
        }

        await db.delete(comments).where(eq(comments.id, commentId));
        return {};
    } catch (e) {
        console.error(e);
        return {
            error: { message: t('Une erreur est survenue lors de la suppression du commentaire') },
        };
    }
};
