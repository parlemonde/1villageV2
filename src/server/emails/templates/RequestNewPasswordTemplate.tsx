import { Section, Heading, Link, Text } from '@react-email/components';
import type { BaseTemplateProps } from '@server/emails/templates/BaseTemplate';
import BaseTemplate from '@server/emails/templates/BaseTemplate';
// import styles from '@server/emails/templates/utils/emailStyles';
import { getExtracted } from 'next-intl/server';

import type { RequestNewPasswordTemplateData } from './utils/types';

interface RequestNewPasswordTemplateProps extends BaseTemplateProps, RequestNewPasswordTemplateData {
    translations: {
        initializeNewPassword: string;
        followLinktoResetPassword: string;
        resetMyPassword: string;
    };
}

export default function RequestNewPasswordTemplate({
    resetPasswordLink = 'https://1v.parlemonde.org',
    translations,
    baseTranslations,
}: RequestNewPasswordTemplateProps) {
    const { initializeNewPassword, followLinktoResetPassword, resetMyPassword } = translations;

    return (
        <BaseTemplate baseTranslations={baseTranslations}>
            <Heading as="h2" style={{ margin: '16px 0' }}>
                {initializeNewPassword}
            </Heading>
            <Section style={{ textAlign: 'left' }}>
                <Text style={{ margin: '0' }}>{followLinktoResetPassword}</Text>
                <Link style={{ fontSize: '14px' }} href={resetPasswordLink}>
                    {resetMyPassword}
                </Link>
            </Section>
            <Section style={{ textAlign: 'left', marginTop: '16px' }}>
                <Text style={{ margin: '0' }}>To modify your password, please click on the following link :</Text>
                <Link style={{ fontSize: '14px' }} href={resetPasswordLink}>
                    Modify my password
                </Link>
            </Section>
        </BaseTemplate>
    );
}

RequestNewPasswordTemplate.PreviewProps = {
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
        initializeNewPassword: 'Réinitialisation de votre mot de passe',
        followLinktoResetPassword: 'En suivant le lien ci-dessous, vous pourrez modifier votre mot de passe :',
        resetMyPassword: 'Modifier mon mot de passe',
    },
} as const;

export const getRequestNewPasswordTranslations = async () => {
    const t = await getExtracted('common');

    const translations: RequestNewPasswordTemplateProps['translations'] = {
        initializeNewPassword: t('Réinitialisation de votre mot de passe'),
        followLinktoResetPassword: t('En suivant le lien ci-dessous, vous pourrez modifier votre mot de passe :'),
        resetMyPassword: t('Modifier mon mot de passe'),
    };

    return translations;
};
