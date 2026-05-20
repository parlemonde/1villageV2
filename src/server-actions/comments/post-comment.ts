'use server';

import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import { classrooms } from '@server/database/schemas/classrooms';
import type { Comment } from '@server/database/schemas/comments';
import { comments } from '@server/database/schemas/comments';
import { users } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { sendCommentNotificationEmail } from '@server/helpers/send-notification-emails';
import { extractTextFromProseMirror } from '@server/lib/extract-text-from-prosemirror';
import { getEnvVariable } from '@server/lib/get-env-variable';
import { logger } from '@server/lib/logger';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { eq } from 'drizzle-orm';
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

        // Send email notifications to subscribed teachers (async, non-blocking)
        try {
            const activity = await db.query.activities.findFirst({
                where: eq(activities.id, activityId),
            });

            if (activity && activity.classroomId) {
                const classroom = await db.query.classrooms.findFirst({
                    where: eq(classrooms.id, activity.classroomId),
                });

                if (classroom) {
                    const classroomTeacher = await db.query.users.findFirst({
                        where: eq(users.id, classroom.teacherId),
                    });

                    // Send email if:
                    // 1. Teacher exists
                    // 2. Teacher has commentActivitySubscribed enabled
                    // 3. The commenter is not the teacher (don't email about own comments)
                    if (classroomTeacher && classroomTeacher.commentActivitySubscribed && classroomTeacher.id !== user.id) {
                        const commentPreview = extractTextFromProseMirror(content, 150);
                        const hostUrl = getEnvVariable('HOST_URL');
                        const activityLink = `${hostUrl}/activities/${activityId}`;

                        await sendCommentNotificationEmail(classroomTeacher, activity.type, user.name, commentPreview, activityLink);
                    }
                }
            }
        } catch (emailError) {
            // Log email sending errors but don't fail the comment creation
            logger.error('Error sending comment notification email:', { emailError });
        }

        return { data };
    } catch (e) {
        logger.error(e);
        return { error: { message: t('Une erreur est survenue lors de la publication du commentaire.') } };
    }
};
