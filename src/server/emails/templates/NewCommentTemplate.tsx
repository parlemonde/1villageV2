import { Heading, Link, Section, Text } from '@react-email/components';
import type { BaseTemplateProps } from '@server/emails/templates/BaseTemplate';
import BaseTemplate from '@server/emails/templates/BaseTemplate';
import styles from '@server/emails/templates/utils/emailStyles';
import { getExtracted } from 'next-intl/server';

import type { NewCommentTemplateData } from './utils/types';

interface NewCommentTemplateProps extends BaseTemplateProps, NewCommentTemplateData {
    translations: {
        newComment: string;
        newCommentMessage: string;
        answerActivityComment: string;
    };
}

export default function NewCommentTemplate({
    firstName,
    activityName,
    commenterName,
    commentPreview,
    link,
    translations,
    baseTranslations,
}: NewCommentTemplateProps) {
    const { newComment, newCommentMessage, answerActivityComment } = translations;

    return (
        <BaseTemplate firstName={firstName} baseTranslations={baseTranslations}>
            <Heading as="h2" style={{ margin: '16px 0' }}>
                {newComment}
            </Heading>
            <Text>
                {newCommentMessage} {activityName}
            </Text>
            {commentPreview && commenterName ? (
                <Section>
                    <Text style={{ fontStyle: 'bold', color: styles.fontDetailColor }}>{commenterName} :</Text>
                    <Text style={{ padding: '10px', backgroundColor: styles.backgroundColor, borderRadius: '4px' }}>
                        &quot;{commentPreview}&quot;
                    </Text>
                </Section>
            ) : null}
            <Text>
                {answerActivityComment} <Link href={link}>{link}</Link>
            </Text>
        </BaseTemplate>
    );
}

NewCommentTemplate.PreviewProps = {
    firstName: 'John Doe',
    confirmationLink: 'https://1v.parlemonde.org',
    activityName: 'Contenu libre',
    commenterName: 'Clint Eastwood',
    commentPreview: '1 Million dollar baby !',
    link: 'http://localhost:3000/activities/45',
    baseTranslations: {
        altText: 'Association Par Le Monde',
        greeting: 'Bonjour',
        notification: 'Vous recevez cette notification e-mail envoyée automatiquement dans le cadre du projet 1Village.',
        joinButton: 'Aller sur 1Village',
        followUs: 'Suivez-nous !',
        donateButton: 'Faire un don',
    },
    translations: {
        newComment: 'Nouveau commentaire',
        newCommentMessage: 'Il y a un nouveau commentaire sous votre activité',
        answerActivityComment: 'Rendez-vous ici pour y répondre :',
    },
} as const;

export const getNewCommentTranslations = async () => {
    const t = await getExtracted('newCommentEmail');

    const translations: NewCommentTemplateProps['translations'] = {
        newComment: t('Nouveau commentaire'),
        newCommentMessage: t('Il y a un nouveau commentaire sous votre activité'),
        answerActivityComment: t('Rendez-vous ici pour y répondre :'),
    };

    return translations;
};
