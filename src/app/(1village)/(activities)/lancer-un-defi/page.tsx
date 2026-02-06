'use client';

import { PageContainer } from '@frontend/components/ui/PageContainer';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
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

    const CHALLENGE_THEMES: { label: string; icon?: ReactNode; name: ChallengeType; href: string }[] = [
        { label: t('Défi linguistique'), icon: <LinguisticIcon />, name: 'linguistique', href: '/lancer-un-defi/linguistique/1' },
        { label: t('Défi culinaire'), icon: <CulinaryIcon />, name: 'culinaire', href: '/lancer-un-defi/culinaire/1' },
        { label: t('Défi écologique'), icon: <EcologicalIcon />, name: 'ecologique', href: '/lancer-un-defi/ecologique/1' },
        { label: t('Lancer un défi sur un thème libre'), name: 'libre', href: '/lancer-un-defi/1' },
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
                            router.push(theme.href);
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
