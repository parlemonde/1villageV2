import { render } from '@react-email/render';

import { ConfirmAccountHtml } from './confirmAccount/ConfirmAccountHtml';
import { getConfirmAccountText } from './confirmAccount/ConfirmAccountText';
import type { EmailTemplate, EmailTemplateProps } from './types';
import { EmailType } from './types';

const templates: Record<EmailType, (props: EmailTemplateProps[EmailType]) => Promise<{ html: React.ReactNode; text: string }>> = {
    [EmailType.CONFIRM_ACCOUNT]: async (props: EmailTemplateProps[EmailType.CONFIRM_ACCOUNT]) => {
        return { html: await ConfirmAccountHtml(props), text: await getConfirmAccountText(props) };
    },
};

export const getTemplate = async <T extends EmailType>(type: T, props: EmailTemplateProps[T]): Promise<EmailTemplate> => {
    const template = await templates[type](props);
    return {
        html: await render(template.html),
        text: template.text,
    };
};
