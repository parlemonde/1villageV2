import { useExtracted } from 'next-intl';

import type { ChallengeCardProps } from './ChallengeCardProps';

export const FreeThemeChallengeCard = ({ activity }: ChallengeCardProps) => {
    const t = useExtracted('FreeThemeChallengeCard');

    if (!activity || activity.type !== 'defi' || activity?.data?.theme !== 'libre') {
        return null;
    }

    return (
        <>
            <p style={{ fontWeight: '500', marginBottom: '16px' }}>{activity?.data?.themeName}</p>
            <p>
                <strong>{t('Votre défi :')}</strong> {activity.data.challengeKind}
            </p>
        </>
    );
};
