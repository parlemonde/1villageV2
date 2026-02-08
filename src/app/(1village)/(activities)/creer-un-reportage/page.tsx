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
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

export const useDefaultReports = () => {
    const t = useExtracted('app.(1village).(activities).creer-un-reportage');

    const DEFAULT_REPORTS: {
        name: string;
        icon: React.ReactNode;
    }[] = [
        { name: t('Nos paysages'), icon: <PaysagesIcon /> },
        { name: t('Nos arts'), icon: <ArtIcon /> },
        { name: t('Nos lieux de vies'), icon: <LieuxViesIcon /> },
        { name: t('Nos langues'), icon: <LanguesIcon /> },
        { name: t('Notre flore et faune'), icon: <FloreFauneIcon /> },
        { name: t('Nos loisirs et jeux'), icon: <LoisirsJeuxIcon /> },
        { name: t('Nos cuisines'), icon: <CuisineIcon /> },
        { name: t('Nos traditions'), icon: <TraditionsIcon /> },
    ];

    return DEFAULT_REPORTS;
};

export default function CreerUnReportagePage() {
    const t = useExtracted('app.(1village).(activities).creer-un-reportage');
    const router = useRouter();
    const { user } = useContext(UserContext);
    const { onCreateActivity } = useContext(ActivityContext);
    const isPelico = user.role === 'admin' || user.role === 'mediator';

    const reports = useDefaultReports();

    return (
        <PageContainer title={t('Sur quel thème souhaitez-vous réaliser votre reportage ?')}>
            <div className={styles.themesContainer}>
                {reports.map((theme) => (
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
                    {t('Créer un reportage sur un autre thème')}
                </button>
            </div>
        </PageContainer>
    );
}
