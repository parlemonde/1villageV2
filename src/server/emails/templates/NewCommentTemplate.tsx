import { Heading, Link, Text } from '@react-email/components';
import type { BaseTemplateProps } from '@server/emails/templates/BaseTemplate';
import BaseTemplate from '@server/emails/templates/BaseTemplate';
import { getExtracted } from 'next-intl/server';

import type { NewCommentTemplateData } from './utils/types';

interface NewCommentTemplateProps extends BaseTemplateProps, NewCommentTemplateData {
    translations: {
        newComment: string;
        newCommentMessage: string;
        commentOn: string;
        viewActivity: string;
    };
}

export default function NewCommentTemplate({
    firstName,
    activityTitle,
    commenterName,
    commentPreview,
    link,
    translations,
    baseTranslations,
}: NewCommentTemplateProps) {
    const { newComment, newCommentMessage, commentOn, viewActivity } = translations;

    return (
        <BaseTemplate firstName={firstName} baseTranslations={baseTranslations}>
            <Heading as="h2" style={{ margin: '16px 0' }}>
                {newComment}
            </Heading>
            <Text>{newCommentMessage}</Text>
            <Heading as="h3" style={{ margin: '16px 0 8px 0', fontSize: '16px' }}>
                {commentOn}: {activityTitle}
            </Heading>
            <Text style={{ fontStyle: 'italic', margin: '8px 0', color: '#666' }}>
                Par <strong>{commenterName}</strong>
            </Text>
            {commentPreview && (
                <Text style={{ margin: '12px 0 16px 0', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    &quot;{commentPreview}&quot;
                </Text>
            )}
            <Link
                href={link}
                style={{
                    display: 'inline-block',
                    margin: '16px 0',
                    padding: '12px 24px',
                    backgroundColor: '#FF6B35',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                }}
            >
                {viewActivity}
            </Link>
        </BaseTemplate>
    );
}

export async function getNewCommentTranslations() {
    const t = await getExtracted('Emails');
    return {
        newComment: t('newComment') || 'Nouveau commentaire',
        newCommentMessage: t('newCommentMessage') || 'Un nouveau commentaire a été publié sur une activité de votre classe.',
        commentOn: t('commentOn') || 'Commentaire sur',
        viewActivity: t('viewActivity') || "Voir l'activité",
    };
}
