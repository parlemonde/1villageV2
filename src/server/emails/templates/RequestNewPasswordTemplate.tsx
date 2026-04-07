import { Html, Container, Section, Row, Column, Heading, Img, Link, Text, Font } from '@react-email/components';
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
    const { altText } = baseTranslations;
    const baseUrl = getEnvVariable('HOST_URL');

    return (
        <Html>
            <Font fontFamily="Roboto" fallbackFontFamily="Arial" fontWeight={400} fontStyle="normal" />
            <Container style={{ padding: '16px', backgroundColor: styles.primaryColor, textAlign: 'center' }}>
                <Section style={{ padding: '16px', backgroundColor: styles.backgroundColor }}>
                    <Container style={{ backgroundColor: 'lightblue' }}>
                        <Img src={`${baseUrl}/static/images/plm-logo.png`} width={90} height={66} alt={altText} />
                        <Heading as="h2" style={{ margin: '16px 0' }}>
                            {initializeNewPassword}
                        </Heading>
                    </Container>
                    <Text>{followLinktoResetPassword}</Text>
                    <Link href={resetPasswordLink}>{resetPasswordLink}</Link>
                    <Section style={{ textAlign: 'center' }}>
                        <Link
                            href={baseUrl}
                            target="_blank"
                            style={{ ...styles.button, borderColor: styles.primaryColor, color: styles.primaryColor }}
                        >
                            <Img src={`${baseUrl}/static/images/android-chrome-192x192.png`} alt="1Village" width={24} height={24} /> {goTo1Village}
                        </Link>
                    </Section>
                    <Section style={{ backgroundColor: 'lightpink' }}>
                        <Text>{followUs}</Text>
                    </Section>
                    <Section>
                        <Row>
                            <Column align="right">
                                <Link href="https://www.facebook.com/associationparlemonde" style={{ display: 'inline-block' }}>
                                    <Img src={`${baseUrl}/static/svg/icon-facebook.svg`} alt="Facebook" />
                                </Link>
                            </Column>
                            <Column align="center" width={50}>
                                <Link href="https://www.linkedin.com/company/par-le-monde/" style={{ display: 'inline-block' }}>
                                    <Img src={`${baseUrl}/static/svg/icon-linkedin.svg`} alt="LinkedIn" />
                                </Link>
                            </Column>
                            <Column align="left">
                                <Link href="https://www.youtube.com/@parlemonde6324" style={{ display: 'inline-block' }}>
                                    <Img src={`${baseUrl}/static/svg/icon-youtube.svg`} alt="Youtube" />
                                </Link>
                            </Column>
                        </Row>
                    </Section>
                </Section>
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
        followUs: 'Suivez-nous',
    },
} as const;

export const getRequestNewPasswordTranslations = async () => {
    const t = await getExtracted('common');

    const translations: RequestNewPasswordTemplateProps['translations'] = {
        initializeNewPassword: t('Réinitialisation de votre mot de passe'),
        followLinktoResetPassword: t('En suivant le lien ci-dessous, vous pourrez modifier votre mot de passe :'),
        goTo1Village: t('Allez sur 1Village'),
        followUs: t('Suivez-nous'),
    };

    return translations;
};
