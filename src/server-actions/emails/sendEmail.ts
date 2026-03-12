'use server';
import { getTransporter } from '@server/emails/transporter';
import { getEnvVariable } from '@server/lib/get-env-variable';
import { logger } from '@server/lib/logger';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { getExtracted } from 'next-intl/server';

export const sendEmail = async (): Promise<ServerActionResponse> => {
    const t = await getExtracted('');
    try {
        const user = getEnvVariable('NODEMAILER_USER');
        const transporter = await getTransporter();

        const info = await transporter.sendMail({
            from: `"Pelico" <${user}>`,
            to: 'recipient@exemple.com',
            subject: 'Hello',
            text: 'Hello world?',
            html: '<b>Hello world?</b>',
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        return {};
    } catch (e) {
        logger.error(e);
        return { error: { message: t("Une erreur est survenue lors de l'envoi de l'email") } };
    }
};
