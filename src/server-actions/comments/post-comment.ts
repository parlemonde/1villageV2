'use server';

import { db } from '@server/database';
import type { Comment } from '@server/database/schemas/comments';
import { comments } from '@server/database/schemas/comments';
import { getCurrentUser } from '@server/helpers/get-current-user';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { getExtracted } from 'next-intl/server';

export const postComment = async ({ activityId, content }: { activityId: number; content: unknown }): Promise<ServerActionResponse<Comment>> => {
    const t = await getExtracted('common');

    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Unauthorized');
        }
        const [data] = await db
            .insert(comments)
            .values({
                activityId: activityId,
                userId: user.id,
                content: content,
            })
            .returning();
        return { data };
    } catch (e) {
        console.error(e);
        return { error: { message: t('Une erreur est survenue lors de la publication du commentaire.') } };
    }
};
