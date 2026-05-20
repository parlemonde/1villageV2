import { Heading, Link, Text } from '@react-email/components';
import type { BaseTemplateProps } from '@server/emails/templates/BaseTemplate';
import BaseTemplate from '@server/emails/templates/BaseTemplate';
import { getExtracted } from 'next-intl/server';

import type { NewAdminPublicationTemplateData } from './utils/types';

interface NewAdminPublicationTemplateProps extends BaseTemplateProps, NewAdminPublicationTemplateData {
    translations: {
        newPublication: string;
        newAdminContent: string;
        exploreNow: string;
    };
}

export default function NewAdminPublicationTemplate({ firstName, link, translations, baseTranslations }: NewAdminPublicationTemplateProps) {
    const { newPublication, newAdminContent, exploreNow } = translations;

    return (
        <BaseTemplate firstName={firstName} baseTranslations={baseTranslations}>
            <Heading as="h2" style={{ margin: '16px 0' }}>
                {newPublication}
            </Heading>
            <Text>{newAdminContent}</Text>
            <Link href={link}>{exploreNow}</Link>
        </BaseTemplate>
    );
}

NewAdminPublicationTemplate.PreviewProps = {
    firstName: 'John Doe',
    confirmationLink: 'https://1v.parlemonde.org',
    link: 'http://localhost:3000/',
    baseTranslations: {
        altText: 'Association Par Le Monde',
        greeting: 'Bonjour',
        notification: 'Vous recevez cette notification e-mail envoyée automatiquement dans le cadre du projet 1Village.',
        joinButton: 'Aller sur 1Village',
        followUs: 'Suivez-nous !',
        donateButton: 'Faire un don',
    },
    translations: {
        newPublication: 'Nouvelle publication de Pelico',
        newAdminContent: 'Un nouveau contenu a été publié dans votre village.',
        exploreNow: 'Découvrer-le maintenant',
    },
} as const;

export async function getNewAdminPublicationTranslations() {
    const t = await getExtracted('Emails');
    const translations: NewAdminPublicationTemplateProps['translations'] = {
        newPublication: t('Nouvelle publication de Pelico'),
        newAdminContent: t('Un nouveau contenu a été publié dans votre village.'),
        exploreNow: t('Découvrer-le maintenant'),
    };

    return translations;
}
