import { render, toPlainText } from '@react-email/render';
import { getBaseTranslations } from '@server/emails/templates/BaseTemplate';
import ConfirmAccountTemplate, { getConfirmAccountTranslations } from '@server/emails/templates/ConfirmAccountTemplate';
import RequestNewPasswordTemplate, { getRequestNewPasswordTranslations } from '@server/emails/templates/RequestNewPasswordTemplate';

import type { EmailTemplateProps } from './types';
import { EmailType } from './types';

const templates: Record<EmailType, (props: EmailTemplateProps[EmailType]) => Promise<React.JSX.Element>> = {
    [EmailType.CONFIRM_ACCOUNT]: async (props: EmailTemplateProps[EmailType.CONFIRM_ACCOUNT]) => {
        const baseTranslations = await getBaseTranslations();
        const translations = await getConfirmAccountTranslations();
        return <ConfirmAccountTemplate {...props} baseTranslations={baseTranslations} translations={translations} />;
    },
    [EmailType.RESET_PASSWORD]: async (props: EmailTemplateProps[EmailType.RESET_PASSWORD]) => {
        const baseTranslations = await getBaseTranslations();
        const translations = await getRequestNewPasswordTranslations();
        return <RequestNewPasswordTemplate {...props} baseTranslations={baseTranslations} translations={translations} />;
    },
};

export const getTemplate = async <T extends EmailType>(type: T, props: EmailTemplateProps[T]): Promise<{ html: string; text: string }> => {
    const template = await templates[type](props);
    const html = await render(template);
    const text = toPlainText(html);

    return { html, text };
};
