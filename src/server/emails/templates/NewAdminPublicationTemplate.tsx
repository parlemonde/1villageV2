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

export default function NewAdminPublicationTemplate({
    firstName,
    title,
    description,
    link,
    translations,
    baseTranslations,
}: NewAdminPublicationTemplateProps) {
    const { newPublication, newAdminContent, exploreNow } = translations;

    return (
        <BaseTemplate firstName={firstName} baseTranslations={baseTranslations}>
            <Heading as="h2" style={{ margin: '16px 0' }}>
                {newPublication}
            </Heading>
            <Text>{newAdminContent}</Text>
            <Heading as="h3" style={{ margin: '16px 0 8px 0', fontSize: '16px' }}>
                {title}
            </Heading>
            {description && <Text style={{ margin: '8px 0' }}>{description}</Text>}
            <Link href={link}>{exploreNow}</Link>
        </BaseTemplate>
    );
}

export async function getNewAdminPublicationTranslations() {
    const t = await getExtracted('Emails');
    return {
        newPublication: t('Nouvelle publication de Pelico'),
        newAdminContent: t('Un nouveau contenu a été publié dans votre village.'),
        exploreNow: t('Découvrer-le maintenant'),
    };
}
