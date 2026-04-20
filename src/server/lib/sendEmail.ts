'use server';
import { getTemplate } from '@server/emails/templates/utils/getTemplate';
import type { EmailTemplateProps, EmailType } from '@server/emails/templates/utils/types';
import { getTransporter } from '@server/emails/transporter';
import { getEnvVariable } from '@server/lib/get-env-variable';
import { logger } from '@server/lib/logger';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { getExtracted } from 'next-intl/server';

export type SendEmailOptions<T extends EmailType = EmailType> = {
    to: string;
    subject: string;
    emailType: T;
    props: EmailTemplateProps[T];
};

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const sendEmail = async <T extends EmailType>(options: SendEmailOptions<T>): Promise<ServerActionResponse> => {
    const { to, subject, emailType, props } = options;
    const t = await getExtracted('common');
    try {
        const domain = getEnvVariable('HOST_DOMAIN');
        const user = domain ? `ne-pas-repondre@${domain}` : getEnvVariable('NODEMAILER_USER');
        const transporter = await getTransporter();

        const { html, text } = await getTemplate(emailType, props);

        await transporter.sendMail({
            from: `"1Village - Par Le Monde" <${user}>`,
            to,
            subject,
            html,
            text,
        });

        return {};
    } catch (e) {
        logger.error(e);
        return { error: { message: t("Une erreur est survenue lors de l'envoi de l'email") } };
    }
};
