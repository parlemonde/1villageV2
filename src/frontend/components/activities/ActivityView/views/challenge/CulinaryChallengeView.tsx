import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import { ContentViewer } from '@frontend/components/content/ContentViewer';
import Image from 'next/image';
import { useExtracted } from 'next-intl';

export const CulinaryChallengeView = ({ activity }: ActivityContentViewProps) => {
    const t = useExtracted('CulinaryChallengeView');

    if (activity.type !== 'defi' || activity?.data?.theme !== 'culinaire') {
        return null;
    }
    return (
        <>
            <p style={{ marginTop: '32px', textAlign: 'center', fontWeight: '500' }}>{activity?.data?.dish?.name}</p>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', marginTop: '32px' }}>
                {activity?.data?.dish?.imageUrl && (
                    <Image
                        width={300}
                        height={200}
                        src={activity.data.dish.imageUrl}
                        alt={activity.data.dish.name ?? ''}
                        style={{ objectFit: 'cover' }}
                    />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p>{activity?.data?.dish?.history}</p>
                    <p>{activity?.data?.dish?.description}</p>
                </div>
            </div>
            <ContentViewer content={activity.data?.content} activityId={activity.id} />
            <div style={{ backgroundColor: 'var(--grey-100)', padding: '16px', borderRadius: '8px' }}>
                <p>
                    <strong>{t('Votre défi :')}</strong> {activity?.data?.challengeKind}
                </p>
            </div>
        </>
    );
};
