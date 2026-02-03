'use client';

import { PageContainer } from '@frontend/components/ui/PageContainer';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { getChallengeFormRoute } from '@frontend/lib/get-challenge-form-route';
import CulinaryIcon from '@frontend/svg/defi/culinaire.svg';
import EcologicalIcon from '@frontend/svg/defi/ecologique.svg';
import LinguisticIcon from '@frontend/svg/defi/linguistique.svg';
import type { ChallengeType } from '@server/database/schemas/activity-types';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import type { ReactNode } from 'react';
import { useContext } from 'react';

import styles from './page.module.css';

export const useChallengeThemes = () => {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi');

    const CHALLENGE_THEMES: { label: string; icon?: ReactNode; name: ChallengeType }[] = [
        { label: t('Défi linguistique'), icon: <LinguisticIcon />, name: 'linguistique' },
        { label: t('Défi culinaire'), icon: <CulinaryIcon />, name: 'culinaire' },
        { label: t('Défi écologique'), icon: <EcologicalIcon />, name: 'ecologique' },
        { label: t('Lancer un défi sur un thème libre'), name: 'libre' },
    ];

    return CHALLENGE_THEMES;
};

export default function LancerUnDefiPage() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi');
    const router = useRouter();
    const { user } = useContext(UserContext);
    const { onCreateActivity } = useContext(ActivityContext);

    const isPelico = user.role === 'admin' || user.role === 'mediator';

    const themes = useChallengeThemes();

    return (
        <PageContainer title={t('Choisissez le défi que vous souhaitez réaliser')}>
            <div className={styles.themesContainer}>
                {themes.map((theme) => (
                    <button
                        key={theme.name}
                        className={styles.themeLink}
                        onClick={() => {
                            onCreateActivity('defi', isPelico, {
                                theme: theme.name,
                            });
                            router.push(getChallengeFormRoute(theme.name));
                        }}
                    >
                        {theme.icon}
                        {theme.label}
                    </button>
                ))}
            </div>
        </PageContainer>
    );
}
