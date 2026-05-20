'use server';

import { db } from '@server/database';
import type { Activity } from '@server/database/schemas/activities';
import { activities } from '@server/database/schemas/activities';
import { classrooms } from '@server/database/schemas/classrooms';
// import { users } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { sendAdminPublicationNotificationEmail } from '@server/helpers/send-notification-emails';
import { getEnvVariable } from '@server/lib/get-env-variable';
import { logger } from '@server/lib/logger';
import { eq, sql } from 'drizzle-orm';

export const publishActivity = async (activity: Partial<Activity>) => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    let publishedActivityId: number | undefined;

    if (activity.id) {
        const { id, ...rest } = activity; // no need to update id
        publishedActivityId = activity.id;
        await db
            .update(activities)
            .set({
                ...rest,
                publishDate: sql`now()`,
            })
            .where(eq(activities.id, activity.id));
    } else {
        const { type, phase, ...rest } = activity;
        if (type === undefined || phase === undefined) {
            throw new Error('Type and phase are required');
        }
        const [inserted] = await db
            .insert(activities)
            .values([
                {
                    ...rest,
                    userId: user.id,
                    type,
                    phase,
                    publishDate: sql`now()`,
                },
            ])
            .returning();
        publishedActivityId = inserted?.id;
    }

    // Send email notifications to subscribed teachers for Pelico (admin) publications (async, non-blocking)
    if (publishedActivityId && activity.isPelico && activity.villageId) {
        try {
            const publishedActivity = await db.query.activities.findFirst({
                where: eq(activities.id, publishedActivityId),
            });

            if (publishedActivity) {
                // Get all classrooms in the village
                const villageClassrooms = await db.query.classrooms.findMany({
                    where: eq(classrooms.villageId, activity.villageId),
                });

                // Get all unique teacher IDs and their subscription preferences
                const teacherIds = [...new Set(villageClassrooms.map((c) => c.teacherId))];
                if (teacherIds.length > 0) {
                    const teachers = await db.query.users.findMany({
                        where: (users, { inArray }) => inArray(users.id, teacherIds),
                    });

                    const hostUrl = getEnvVariable('HOST_URL');
                    const activityLink = `${hostUrl}/activites/${publishedActivityId}`;

                    // Send emails to all subscribed teachers
                    for (const teacher of teachers) {
                        if (teacher.adminPublicationSubscribed) {
                            await sendAdminPublicationNotificationEmail(teacher, activityLink);
                        }
                    }
                }
            }
        } catch (emailError) {
            // Log email sending errors but don't fail the activity publication
            logger.error('Error sending admin publication notification emails:', { emailError });
        }
    }
};
