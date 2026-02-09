import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import { ContentViewer } from '@frontend/components/content/ContentViewer';
import { useExtracted } from 'next-intl';

export const EcologicalChallengeView = ({ activity }: ActivityContentViewProps) => {
    const t = useExtracted('EcologicalChallengeView');

    if (activity.type !== 'defi' || activity?.data?.theme !== 'ecologique') {
        return null;
    }

    return (
        <>
            <p style={{ marginTop: '32px', textAlign: 'center', fontWeight: '500' }}>{activity?.data?.action}</p>
            <ContentViewer content={activity.data?.content} activityId={activity.id} />
            <div style={{ backgroundColor: 'var(--grey-100)', padding: '16px', borderRadius: '8px' }}>
                <p>
                    <strong>{t('Votre défi :')}</strong> {activity?.data?.challengeKind}
                </p>
            </div>
        </>
    );
};
