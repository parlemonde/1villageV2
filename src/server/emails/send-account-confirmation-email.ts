import { EmailType } from '@server/emails/templates/utils/types';
import { sendEmail } from '@server/lib/sendEmail';
import { getExtracted } from 'next-intl/server';

export const sendAccountConfirmationEmail = async (to: string, confirmationLink: string) => {
    const t = await getExtracted('common');
    await sendEmail(to, t('Confirmez votre compte'), EmailType.CONFIRM_ACCOUNT, {
        firstName: 'John Doe',
        confirmationLink,
    });
};
