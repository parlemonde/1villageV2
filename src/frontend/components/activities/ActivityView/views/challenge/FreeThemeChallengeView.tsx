import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import { ContentViewer } from '@frontend/components/content/ContentViewer';
import { useExtracted } from 'next-intl';

export const FreeThemeChallengeView = ({ activity }: ActivityContentViewProps) => {
    const t = useExtracted('FreeThemeChallengeView');

    if (activity.type !== 'defi' || activity?.data?.theme !== 'libre') {
        return null;
    }
    return (
        <>
            <p style={{ fontWeight: '500', marginBottom: '16px' }}>{activity?.data?.themeName}</p>
            <ContentViewer content={activity.data?.content} activityId={activity.id} />
            <div style={{ backgroundColor: 'var(--grey-100)', padding: '16px', borderRadius: '8px' }}>
                <p>
                    <strong>{t('Votre défi :')}</strong> {activity?.data?.challengeKind}
                </p>
            </div>
        </>
    );
};
