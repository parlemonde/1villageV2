'use server';

import type { ActivityType } from '@server/database/schemas/activity-types';
import type { User } from '@server/database/schemas/users';
import { EmailType } from '@server/emails/templates/utils/types';
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
        const t = await getExtracted('emailing');
        const translatedActivityName = await getActivityName(activityType as ActivityType);
        const subject = t('Un nouveau commentaire sous votre activité {type}', { type: translatedActivityName });

        await sendEmail({
            to: teacher.email,
            subject: subject,
            emailType: EmailType.NEW_COMMENT,
            props: {
                firstName: teacher.name.split(' ')[0],
                activityName: translatedActivityName,
                commenterName,
                commentPreview,
                link: activityLink,
            },
        });
    } catch (error) {
        logger.error(`Failed to send comment notification email to ${teacher.email}:`, { error });
    }
}

export async function sendAdminPublicationNotificationEmail(teacher: User, publicationLink: string): Promise<void> {
    try {
        const t = await getExtracted('emailing');
        const subject = t('Nouvelle publication de Pelico');

        await sendEmail({
            to: teacher.email,
            subject: subject,
            emailType: EmailType.NEW_ADMIN_PUBLICATION,
            props: {
                firstName: teacher.name.split(' ')[0],
                link: publicationLink,
            },
        });
    } catch (error) {
        logger.error(`Failed to send admin publication notification email to ${teacher.email}:`, { error });
    }
}
