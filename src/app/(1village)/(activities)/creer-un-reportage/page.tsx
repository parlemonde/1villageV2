'use client';

import { PageContainer } from '@frontend/components/ui/PageContainer';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import ArtIcon from '@frontend/svg/indices/art.svg';
import CuisineIcon from '@frontend/svg/indices/cuisine.svg';
import FloreFauneIcon from '@frontend/svg/indices/flore-faune.svg';
import LanguesIcon from '@frontend/svg/indices/langues.svg';
import LieuxViesIcon from '@frontend/svg/indices/lieux-de-vie.svg';
import LoisirsJeuxIcon from '@frontend/svg/indices/loisirs-jeux.svg';
import PaysagesIcon from '@frontend/svg/indices/paysages.svg';
import TraditionsIcon from '@frontend/svg/indices/tradition.svg';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';

import styles from './page.module.css';

export const DEFAULT_REPORTS: {
    name: string;
    icon: React.ReactNode;
}[] = [
    { name: 'Nos paysages', icon: <PaysagesIcon /> },
    { name: 'Nos arts', icon: <ArtIcon /> },
    { name: 'Nos lieux de vies', icon: <LieuxViesIcon /> },
    { name: 'Nos langues', icon: <LanguesIcon /> },
    { name: 'Notre flore et faune', icon: <FloreFauneIcon /> },
    { name: 'Nos loisirs et jeux', icon: <LoisirsJeuxIcon /> },
    { name: 'Nos cuisines', icon: <CuisineIcon /> },
    { name: 'Nos traditions', icon: <TraditionsIcon /> },
];

export default function CreerUnReportagePage() {
    const router = useRouter();
    const { user } = useContext(UserContext);
    const { onCreateActivity } = useContext(ActivityContext);
    const isPelico = user.role === 'admin' || user.role === 'mediator';

    return (
        <PageContainer title="Sur quel thème souhaitez-vous réaliser votre reportage ?">
            <div className={styles.themesContainer}>
                {DEFAULT_REPORTS.map((theme) => (
                    <button
                        key={theme.name}
                        className={styles.themeLink}
                        onClick={() => {
                            onCreateActivity('reportage', isPelico, {
                                defaultReport: theme.name,
                            });
                            router.push('/creer-un-reportage/1');
                        }}
                    >
                        {theme.icon}
                        {theme.name}
                    </button>
                ))}
                <button
                    className={styles.themeLink}
                    onClick={() => {
                        onCreateActivity('reportage', isPelico);
                        router.push('/creer-un-reportage/1');
                    }}
                >
                    Créer un reportage sur un autre thème
                </button>
            </div>
        </PageContainer>
    );
}
