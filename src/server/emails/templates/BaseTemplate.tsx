import { Html, Img, Heading, Section, Font, Text, Link, Row, Column, Container } from '@react-email/components';
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
        donateButton: string;
    };
}

export default function BaseTemplate({ children, firstName, baseTranslations }: BaseTemplateProps) {
    const { altText, greeting, notification, joinButton, donateButton } = baseTranslations;
    const appUrl = getEnvVariable('HOST_URL');
    return (
        <Html>
            <Font fontFamily="Roboto" fallbackFontFamily="Arial" fontWeight={400} fontStyle="normal" />
            <Section style={{ padding: '16px 8px', backgroundColor: styles.textOrangeBackground }}>
                <Img src={getEnvVariable('HOST_URL') + '/static/images/plm-logo.png'} width={90} height={66} alt={altText} />
                <Heading as="h2" style={{ textAlign: 'center' }}>
                    {greeting} {firstName}
                </Heading>
            </Section>
            <Section style={{ padding: '16px' }}>{children}</Section>
            <Section style={{ padding: '16px', textAlign: 'right' }}>
                <Text style={{ fontSize: '12px', fontStyle: 'italic', color: styles.grey500 }}>{notification}</Text>
            </Section>
            <Section style={{ padding: '16px', backgroundColor: styles.textOrangeBackground }}>
                <Container>
                    <Row>
                        <Column align="center">
                            <Link
                                href={appUrl}
                                target="_blank"
                                style={{ ...styles.button, backgroundColor: styles.secondaryColor, color: styles.fontColor }}
                            >
                                {joinButton}
                            </Link>
                        </Column>
                        <Column>
                            <Link
                                href="https://parlemonde.org/faire-un-don/"
                                target="_blank"
                                style={{ ...styles.button, backgroundColor: styles.primaryColor }}
                            >
                                {donateButton}
                            </Link>
                        </Column>
                    </Row>
                </Container>
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
        donateButton: 'Faire un don',
    },
};

export const getBaseTranslations = async () => {
    const t = await getExtracted('common');

    const translations: BaseTemplateProps['baseTranslations'] = {
        altText: t('Association Par Le Monde'),
        greeting: t('Bonjour'),
        notification: t('Vous recevez cette notification e-mail envoyée automatiquement dans le cadre du projet 1Village.'),
        joinButton: t('Rejoindre 1Village'),
        donateButton: t('Faire un don'),
    };

    return translations;
};
