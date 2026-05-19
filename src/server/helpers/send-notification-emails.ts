'use server';

import type { User } from '@server/database/schemas/users';
import type { EmailType } from '@server/emails/templates/utils/types';
import { logger } from '@server/lib/logger';
import { sendEmail } from '@server/lib/sendEmail';
import { getExtracted } from 'next-intl/server';

export async function sendCommentNotificationEmail(
    teacher: User,
    activityTitle: string,
    commenterName: string,
    commentPreview: string | undefined,
    activityLink: string,
): Promise<void> {
    try {
        const t = await getExtracted('Emails');
        const subject = t('newCommentEmailSubject') || `Nouveau commentaire sur "${activityTitle}"`;

        await sendEmail({
            to: teacher.email,
            subject: subject,
            emailType: 'NEW_COMMENT' as EmailType,
            props: {
                firstName: teacher.name.split(' ')[0],
                activityTitle,
                commenterName,
                commentPreview,
                link: activityLink,
            },
        });
    } catch (error) {
        logger.error(`Failed to send comment notification email to ${teacher.email}:`, { error: JSON.stringify(error) });
    }
}

export async function sendAdminPublicationNotificationEmail(
    teacher: User,
    publicationTitle: string,
    publicationDescription: string | undefined,
    publicationLink: string,
): Promise<void> {
    try {
        const t = await getExtracted('Emails');
        const subject = t('newPublicationEmailSubject') || `Nouvelle publication: ${publicationTitle}`;

        await sendEmail({
            to: teacher.email,
            subject: subject,
            emailType: 'NEW_ADMIN_PUBLICATION' as EmailType,
            props: {
                firstName: teacher.name.split(' ')[0],
                title: publicationTitle,
                description: publicationDescription,
                link: publicationLink,
            },
        });
    } catch (error) {
        logger.error(`Failed to send admin publication notification email to ${teacher.email}:`, { error: JSON.stringify(error) });
    }
}
