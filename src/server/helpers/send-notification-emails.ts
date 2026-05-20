'use server';

import type { ActivityType } from '@server/database/schemas/activity-types';
import type { User } from '@server/database/schemas/users';
import type { EmailType } from '@server/emails/templates/utils/types';
import { getActivityName } from '@server/entities/activity-name';
import { logger } from '@server/lib/logger';
import { sendEmail } from '@server/lib/sendEmail';
import { getExtracted } from 'next-intl/server';

export async function sendCommentNotificationEmail(
    teacher: User,
    activityType: string,
    commenterName: string,
    commentPreview: string | undefined,
    activityLink: string,
): Promise<void> {
    try {
        const t = await getExtracted('Emails');
        const translatedActivityName = await getActivityName(activityType as ActivityType);
        const subject = t('Un nouveau commentaire sous votre activité {type}', { type: translatedActivityName });

        await sendEmail({
            to: teacher.email,
            subject: subject,
            emailType: 'NEW_COMMENT' as EmailType,
            props: {
                firstName: teacher.name.split(' ')[0],
                activityType: translatedActivityName,
                commenterName,
                commentPreview,
                link: activityLink,
            },
        });
    } catch (error) {
        logger.error(`Failed to send comment notification email to ${teacher.email}:`, { error: JSON.stringify(error) });
    }
}

export async function sendAdminPublicationNotificationEmail(teacher: User, publicationLink: string): Promise<void> {
    try {
        const t = await getExtracted('Emails');
        const subject = t('Nouvelle publication de Pelico');

        await sendEmail({
            to: teacher.email,
            subject: subject,
            emailType: 'NEW_ADMIN_PUBLICATION' as EmailType,
            props: {
                firstName: teacher.name.split(' ')[0],
                link: publicationLink,
            },
        });
    } catch (error) {
        logger.error(`Failed to send admin publication notification email to ${teacher.email}:`, { error: JSON.stringify(error) });
    }
}
