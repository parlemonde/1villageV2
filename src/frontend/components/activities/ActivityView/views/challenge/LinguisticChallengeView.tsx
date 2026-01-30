import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import { ContentViewer } from '@frontend/components/content/ContentViewer';
import type { LinguisticChallenge } from '@server/database/schemas/activity-types';
import isoLanguages from '@server-actions/languages/iso-639-languages.json';
import { useExtracted } from 'next-intl';

export const LinguisticChallengeView = ({ activity }: ActivityContentViewProps) => {
    const t = useExtracted('LinguisticChallengeView');

    if (activity.type !== 'defi' || activity?.data?.theme !== 'linguistique') {
        return null;
    }

    const linguisticData = activity.data as LinguisticChallenge;
    const language = isoLanguages.find((l) => l.code === linguisticData.language)?.name ?? '';

    return (
        <>
            <p style={{ marginTop: '32px', textAlign: 'center', fontWeight: '500' }}>
                {t('Voilà un mot en {language}', { language: language })}, {t('une langue')} {activity.data.languageKnowledge}.
            </p>
            <ContentViewer content={activity.data?.content} activityId={activity.id} />
            <div style={{ backgroundColor: 'var(--grey-100)', padding: '16px', borderRadius: '8px' }}>
                <p>
                    <strong>{t('Votre défi :')}</strong> {activity?.data?.challengeKind}
                </p>
            </div>
        </>
    );
};
