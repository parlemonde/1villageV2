import { BaseHtml } from '@server/emails/templates/base/BaseHtml';
import type { EmailTemplateProps, EmailType } from '@server/emails/templates/types';
import { getExtracted } from 'next-intl/server';

export const ConfirmAccountHtml = async ({ confirmationLink }: EmailTemplateProps[EmailType.CONFIRM_ACCOUNT]) => {
    const t = await getExtracted('common');
    return (
        <BaseHtml>
            <h2 style={{ margin: '16px 0' }}>{t('Confirmez votre compte')}</h2>
            <p>{t('Pour activer votre compte, merci de cliquer sur le lien ci-dessous :')}</p>
            <a href={confirmationLink}>{confirmationLink}</a>
            <p>{t('Une fois votre compte activé, vous pourrez accéder aux échanges en ligne sur 1Village.')}</p>
            <p>{t('À bientôt')}</p>
        </BaseHtml>
    );
};
