'use client';
import { useExtracted } from 'next-intl';

import type { ChallengeCardProps } from './ChallengeCardProps';

export const EcologicalChallengeCard = ({ activity }: ChallengeCardProps) => {
    const t = useExtracted('EcologicalChallengeCard');
    if (!activity || activity.type !== 'defi' || activity?.data?.theme !== 'ecologique') {
        return null;
    }

    return (
        <>
            <p style={{ fontWeight: '500', marginBottom: '16px' }}>{activity?.data?.action}</p>
            <p>
                <strong>{t('Votre défi :')}</strong> {activity.data.challengeKind}
            </p>
        </>
    );
};
