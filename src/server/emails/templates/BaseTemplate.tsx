import { Html, Row, Column, Img, Section, Font, Text, Link } from '@react-email/components';
import styles from '@server/emails/templates/utils/emailStyles';
import { getEnvVariable } from '@server/lib/get-env-variable';
import { getExtracted } from 'next-intl/server';

import type { BaseTemplateData } from './utils/types';

export interface BaseTemplateProps extends BaseTemplateData {
    baseTranslations: {
        altText: string;
        greeting: string;
        notification: string;
        joinButton: string;
        followUs: string;
    };
}

export default function BaseTemplate({ children, baseTranslations }: BaseTemplateProps) {
    const { altText, notification, joinButton, followUs } = baseTranslations;
    const baseUrl = getEnvVariable('HOST_URL');
    return (
        <Html>
            <Section style={{ padding: '16px', backgroundColor: styles.primaryColor }}>
                <Section style={{ backgroundColor: styles.backgroundColor }}>
                    <Font fontFamily="Roboto" fallbackFontFamily="Arial" fontWeight={400} fontStyle="normal" />
                    {/* Header */}
                    <Section style={{ backgroundColor: 'white' }}>
                        <Row>
                            <Column align="center" width="60%">
                                <Img src={`${baseUrl}/static/images/plm-logo-allonge.jpg`} width="100%" height="auto" alt={altText} />
                            </Column>
                            <Column align="center" width="40%">
                                <Img src={`${baseUrl}/static/images/android-chrome-192x192.png`} alt="1Village" width="64" height="64" />
                            </Column>
                        </Row>
                    </Section>

                    {/* Children */}
                    <Section style={{ padding: '16px' }}>{children}</Section>

                    {/* Footer */}
                    <Section style={{ textAlign: 'center' }}>
                        <Section style={{ padding: '16px' }}>
                            <Link
                                href={baseUrl}
                                target="_blank"
                                style={{ ...styles.button, borderColor: styles.primaryColor, color: styles.primaryColor }}
                            >
                                <Img src={`${baseUrl}/static/images/android-chrome-192x192.png`} alt="1Village" width={24} height={24} />
                                {joinButton}
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
                    </Section>
                </Section>
            </Section>
        </Html>
    );
}

BaseTemplate.PreviewProps = {
    firstName: 'John Doe',
    baseTranslations: {
        altText: 'Association Par Le Monde',
        greeting: 'Bonjour',
        notification: 'Vous recevez cette notification e-mail envoyée automatiquement dans le cadre du projet 1Village.',
        joinButton: 'Rejoindre 1Village',
        followUs: 'Suivez-nous !',
    },
};

export const getBaseTranslations = async () => {
    const t = await getExtracted('common');

    const translations: BaseTemplateProps['baseTranslations'] = {
        altText: t('Association Par Le Monde'),
        greeting: t('Bonjour'),
        notification: t('Vous recevez cette notification e-mail envoyée automatiquement dans le cadre du projet 1Village.'),
        joinButton: t('Rejoindre 1Village'),
        followUs: t('Suivez-nous !'),
    };

    return translations;
};
