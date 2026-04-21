import { Heading, Link, Text } from '@react-email/components';
import type { BaseTemplateProps } from '@server/emails/templates/BaseTemplate';
import BaseTemplate from '@server/emails/templates/BaseTemplate';
import { getExtracted } from 'next-intl/server';

import type { ConfirmAccountTemplateData } from './utils/types';

interface ConfirmAccountTemplateProps extends BaseTemplateProps, ConfirmAccountTemplateData {
    translations: {
        confirmYourAccount: string;
        clickHereToActivateYourAccount: string;
        yourAccountWillBeActivatedSoon: string;
        seeYouSoon: string;
    };
}

export default function ConfirmAccountTemplate({
    firstName,
    confirmationLink = 'https://1v.parlemonde.org',
    translations,
    baseTranslations,
}: ConfirmAccountTemplateProps) {
    const { confirmYourAccount, clickHereToActivateYourAccount, yourAccountWillBeActivatedSoon, seeYouSoon } = translations;
    return (
        <BaseTemplate firstName={firstName} baseTranslations={baseTranslations}>
            <Heading as="h2" style={{ margin: '16px 0' }}>
                {confirmYourAccount}
            </Heading>
            <Text>{clickHereToActivateYourAccount}</Text>
            <Link className="link" href={confirmationLink}>
                {confirmationLink}
            </Link>
            <Text>{yourAccountWillBeActivatedSoon}</Text>
            <Text>{seeYouSoon}</Text>
        </BaseTemplate>
    );
}

ConfirmAccountTemplate.PreviewProps = {
    firstName: 'John Doe',
    confirmationLink: 'https://1v.parlemonde.org',
    baseTranslations: {
        altText: 'Association Par Le Monde',
        greeting: 'Bonjour',
        notification: 'Vous recevez cette notification e-mail envoyée automatiquement dans le cadre du projet 1Village.',
        joinButton: 'Rejoindre 1Village',
        donateButton: 'Faire un don',
    },
    translations: {
        confirmYourAccount: 'Confirmez votre compte',
        clickHereToActivateYourAccount: 'Pour activer votre compte, merci de cliquer sur le lien ci-dessous :',
        yourAccountWillBeActivatedSoon: 'Une fois votre compte activé, vous pourrez accéder aux échanges en ligne sur 1Village.',
        seeYouSoon: 'À bientôt',
    },
} as const;

export const getConfirmAccountTranslations = async () => {
    const t = await getExtracted('common');

    const translations: ConfirmAccountTemplateProps['translations'] = {
        confirmYourAccount: t('Confirmez votre compte'),
        clickHereToActivateYourAccount: t('Pour activer votre compte, merci de cliquer sur le lien ci-dessous :'),
        yourAccountWillBeActivatedSoon: t('Une fois votre compte activé, vous pourrez accéder aux échanges en ligne sur 1Village.'),
        seeYouSoon: t('À bientôt'),
    };

    return translations;
};
