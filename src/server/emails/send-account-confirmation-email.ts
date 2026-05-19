import { EmailType } from '@server/emails/templates/utils/types';
import { sendEmail } from '@server/lib/sendEmail';
import { getExtracted } from 'next-intl/server';

export const sendAccountConfirmationEmail = async (to: string, confirmationLink: string) => {
    const t = await getExtracted('common');
    await sendEmail({
        to,
        subject: t('Confirmez votre compte'),
        emailType: EmailType.CONFIRM_ACCOUNT,
        props: {
            firstName: 'John Doe',
            confirmationLink,
        },
    });
};
