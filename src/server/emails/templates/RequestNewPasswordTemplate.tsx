import { Html, Container, Section, Heading, Img, Link, Text, Font } from '@react-email/components';
import type { BaseTemplateProps } from '@server/emails/templates/BaseTemplate';
import styles from '@server/emails/templates/utils/emailStyles';
import { getEnvVariable } from '@server/lib/get-env-variable';
import { getExtracted } from 'next-intl/server';

import type { RequestNewPasswordTemplateData } from './utils/types';

interface RequestNewPasswordTemplateProps extends BaseTemplateProps, RequestNewPasswordTemplateData {
    translations: {
        initializeNewPassword: string;
        followLinktoResetPassword: string;
        goTo1Village: string;
        followUs: string;
    };
}

export default function RequestNewPasswordTemplate({
    resetPasswordLink = 'https://1v.parlemonde.org',
    translations,
    baseTranslations,
}: RequestNewPasswordTemplateProps) {
    const { initializeNewPassword, followLinktoResetPassword, goTo1Village, followUs } = translations;
    const { altText, notification } = baseTranslations;
    const baseUrl = getEnvVariable('HOST_URL');

    return (
        <Html>
            <Font fontFamily="Roboto" fallbackFontFamily="Arial" fontWeight={400} fontStyle="normal" />
            <Container style={{ padding: '16px', backgroundColor: styles.primaryColor }}>
                <Container style={{ textAlign: 'center', backgroundColor: styles.backgroundColor }}>
                    <Section>
                        <Img src={`${baseUrl}/static/images/plm-logo-allonge.jpg`} width="100%" height="auto" alt={altText} />
                        <Heading as="h2" style={{ margin: '16px 0' }}>
                            {initializeNewPassword}
                        </Heading>
                    </Section>
                    <Section style={{ textAlign: 'left', padding: '16px' }}>
                        <Text style={{ margin: '0' }}>{followLinktoResetPassword}</Text>
                        <Link style={{ fontSize: '14px' }} href={resetPasswordLink}>
                            {resetPasswordLink}
                        </Link>
                    </Section>
                    <Section style={{ padding: '16px' }}>
                        <Link
                            href={baseUrl}
                            target="_blank"
                            style={{ ...styles.button, borderColor: styles.primaryColor, color: styles.primaryColor }}
                        >
                            <Img src={`${baseUrl}/static/images/android-chrome-192x192.png`} alt="1Village" width={24} height={24} /> {goTo1Village}
                        </Link>
                    </Section>
                    <Section>
                        <Text style={{ fontSize: '12px', fontStyle: 'italic', color: styles.grey500 }}>{notification}</Text>
                    </Section>
                    <Section style={{ padding: '0 0 16px' }}>
                        <Text style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>{followUs}</Text>
                        <Link href="https://www.facebook.com/associationparlemonde" style={{ ...styles.socialButton, margin: '0 4px' }}>
                            <Img src={`${baseUrl}/static/svg/icon-facebook.svg`} alt="Facebook" width={18} height={18} />
                        </Link>
                        <Link href="https://www.linkedin.com/company/par-le-monde/" style={{ ...styles.socialButton, margin: '0 4px' }}>
                            <Img src={`${baseUrl}/static/svg/icon-linkedin.svg`} alt="LinkedIn" width={18} height={18} />
                        </Link>
                        <Link href="https://www.youtube.com/@parlemonde6324" style={{ ...styles.socialButton, margin: '0 4px' }}>
                            <Img src={`${baseUrl}/static/svg/icon-youtube.svg`} alt="Youtube" width={18} height={18} />
                        </Link>
                    </Section>
                </Container>
            </Container>
        </Html>
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
        goTo1Village: 'Allez sur 1Village',
        followUs: 'Suivez-nous !',
    },
} as const;

export const getRequestNewPasswordTranslations = async () => {
    const t = await getExtracted('common');

    const translations: RequestNewPasswordTemplateProps['translations'] = {
        initializeNewPassword: t('Réinitialisation de votre mot de passe'),
        followLinktoResetPassword: t('En suivant le lien ci-dessous, vous pourrez modifier votre mot de passe :'),
        goTo1Village: t('Allez sur 1Village'),
        followUs: t('Suivez-nous !'),
    };

    return translations;
};
