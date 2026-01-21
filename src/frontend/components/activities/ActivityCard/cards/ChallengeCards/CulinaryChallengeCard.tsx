'use client';

import Image from 'next/image';
import { useExtracted } from 'next-intl';

import type { ChallengeCardProps } from './ChallengeCardProps';

export const CulinaryChallengeCard = ({ activity }: ChallengeCardProps) => {
    const t = useExtracted('CulinaryChallengeCard');

    if (!activity || activity.type !== 'defi' || activity?.data?.theme !== 'culinaire') {
        return null;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
            {activity.data.dish?.imageUrl && (
                <div style={{ position: 'relative', width: '200px', height: '150px' }}>
                    <Image
                        src={activity.data.dish?.imageUrl}
                        alt={activity.data.dish?.name ?? t('Image du plat')}
                        layout="fill"
                        sizes="200px"
                        style={{ objectFit: 'fill' }}
                    />
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontWeight: '500' }}>{activity.data.dish?.name}</p>
                <p>
                    {activity?.data?.dish?.history} {activity?.data?.dish?.description}
                </p>
                <p>
                    <strong>{t('Votre défi :')}</strong> {activity.data.challengeKind}
                </p>
            </div>
        </div>
    );
};
