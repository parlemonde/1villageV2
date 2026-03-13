import { BaseText } from '@server/emails/templates/base/BaseText';
import type { EmailTemplateProps, EmailType } from '@server/emails/templates/types';
import { getExtracted } from 'next-intl/server';

export const getConfirmAccountText = async ({ confirmationLink }: EmailTemplateProps[EmailType.CONFIRM_ACCOUNT]): Promise<string> => {
    const t = await getExtracted('common');

    const content = `
${t('Confirmez votre compte')}

${t('Pour activer votre compte, merci de cliquer sur ce lien :')}

${confirmationLink}

${t('Une fois votre compte activé, vous pourrez renseigner l’identifiant de votre enfant transmis par son professeur, et accéder aux échanges en ligne sur 1Village.')}
${t('À bientôt')}
`;

    return await BaseText({ children: content });
};
