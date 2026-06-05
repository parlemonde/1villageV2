import { render, toPlainText } from '@react-email/render';
import AdminNotificationTemplate from '@server/emails/templates/AdminNotificationTemplate';
import { getBaseTranslations } from '@server/emails/templates/BaseTemplate';
import ConfirmAccountTemplate, { getConfirmAccountTranslations } from '@server/emails/templates/ConfirmAccountTemplate';
import NewAdminPublicationTemplate, { getNewAdminPublicationTranslations } from '@server/emails/templates/NewAdminPublicationTemplate';
import NewCommentTemplate, { getNewCommentTranslations } from '@server/emails/templates/NewCommentTemplate';
import RequestNewPasswordTemplate, { getRequestNewPasswordTranslations } from '@server/emails/templates/RequestNewPasswordTemplate';

import type { EmailTemplateProps } from './types';
import { EmailType } from './types';

type TemplateMap = {
    [K in EmailType]: (props: EmailTemplateProps[K]) => Promise<React.JSX.Element>;
};

const templates: TemplateMap = {
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
    [EmailType.NEW_ADMIN_PUBLICATION]: async (props: EmailTemplateProps[EmailType.NEW_ADMIN_PUBLICATION]) => {
        const baseTranslations = await getBaseTranslations();
        const translations = await getNewAdminPublicationTranslations();
        return <NewAdminPublicationTemplate {...props} baseTranslations={baseTranslations} translations={translations} />;
    },
    [EmailType.NEW_COMMENT]: async (props: EmailTemplateProps[EmailType.NEW_COMMENT]) => {
        const baseTranslations = await getBaseTranslations();
        const translations = await getNewCommentTranslations();
        return <NewCommentTemplate {...props} baseTranslations={baseTranslations} translations={translations} />;
    },
    [EmailType.INVALID_VILLAGE]: async (props: EmailTemplateProps[EmailType.INVALID_VILLAGE]) => {
        return <AdminNotificationTemplate type={EmailType.INVALID_VILLAGE} {...props} />;
    },
    [EmailType.INVALID_COUNTRY]: async (props: EmailTemplateProps[EmailType.INVALID_COUNTRY]) => {
        return <AdminNotificationTemplate type={EmailType.INVALID_COUNTRY} {...props} />;
    },
    [EmailType.UNASSIGNED_VILLAGE]: async (props: EmailTemplateProps[EmailType.UNASSIGNED_VILLAGE]) => {
        return <AdminNotificationTemplate type={EmailType.UNASSIGNED_VILLAGE} {...props} />;
    },
};

export const getTemplate = async <T extends EmailType>(type: T, props: EmailTemplateProps[T]): Promise<{ html: string; text: string }> => {
    const template = await templates[type](props);
    const html = await render(template);
    const text = toPlainText(html);

    return { html, text };
};
