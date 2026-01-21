import type { LinguisticChallenge } from '@server/database/schemas/activity-types';
import isoLanguages from '@server-actions/languages/iso-639-languages.json';
import { useExtracted } from 'next-intl';

import type { ChallengeCardProps } from './ChallengeCardProps';

export const LinguisticChallengeCard = ({ activity }: ChallengeCardProps) => {
    const t = useExtracted('LinguisticChallengeCard');

    if (!activity || activity.type !== 'defi' || activity?.data?.theme !== 'linguistique') {
        return null;
    }

    const linguisticData = activity.data as LinguisticChallenge;

    const language = isoLanguages.find((l) => l.code === linguisticData.language)?.name ?? '';

    return (
        <>
            <p style={{ fontWeight: '500', marginBottom: '16px' }}>
                {t('Voilà un mot en {language}', { language: language })}, {t('une langue')} {activity.data.languageKnowledge}.
            </p>
            <p>
                <strong>{t('Votre défi :')}</strong> {activity.data.challengeKind}
            </p>
        </>
    );
};
