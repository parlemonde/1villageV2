'use client';

import { PageContainer } from '@frontend/components/ui/PageContainer';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import AnimalNationalIcon from '@frontend/svg/indices/animal-national.svg';
import ArtIcon from '@frontend/svg/indices/art.svg';
import CuisineIcon from '@frontend/svg/indices/cuisine.svg';
import DeviseIcon from '@frontend/svg/indices/devise.svg';
import DrapeauIcon from '@frontend/svg/indices/drapeau.svg';
import EmblemeIcon from '@frontend/svg/indices/embleme.svg';
import FigureSymboliqueIcon from '@frontend/svg/indices/figure-symbolique.svg';
import FleurNationaleIcon from '@frontend/svg/indices/fleur-nationale.svg';
import FloreFauneIcon from '@frontend/svg/indices/flore-faune.svg';
import HymneIcon from '@frontend/svg/indices/hymne.svg';
import LanguesIcon from '@frontend/svg/indices/langues.svg';
import LieuxViesIcon from '@frontend/svg/indices/lieux-de-vie.svg';
import LoisirsJeuxIcon from '@frontend/svg/indices/loisirs-jeux.svg';
import MonnaieIcon from '@frontend/svg/indices/monnaie.svg';
import PaysagesIcon from '@frontend/svg/indices/paysages.svg';
import TraditionsIcon from '@frontend/svg/indices/tradition.svg';
import { useRouter } from 'next/navigation';
import React from 'react';

import styles from './page.module.css';

export const DEFAULT_HINTS: {
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
    { name: 'Un drapeau', icon: <DrapeauIcon /> },
    { name: 'Un emblème', icon: <EmblemeIcon /> },
    { name: 'Une fleur nationale', icon: <FleurNationaleIcon /> },
    { name: 'Une devise', icon: <DeviseIcon /> },
    { name: 'Un hymne', icon: <HymneIcon /> },
    { name: 'Un animal national', icon: <AnimalNationalIcon /> },
    { name: 'Une figure symbolique', icon: <FigureSymboliqueIcon /> },
    { name: 'Une monnaie', icon: <MonnaieIcon /> },
];

export default function CreerUnIndicePage() {
    const router = useRouter();
    const { user } = React.useContext(UserContext);
    const { onCreateActivity } = React.useContext(ActivityContext);
    const isPelico = user.role === 'admin' || user.role === 'mediator';
    return (
        <PageContainer title="Sur quel thème souhaitez-vous réaliser votre indice ?">
            <div className={styles.themesContainer}>
                {DEFAULT_HINTS.map((theme) => (
                    <button
                        key={theme.name}
                        className={styles.themeLink}
                        onClick={() => {
                            onCreateActivity('indice', isPelico, {
                                content: [],
                                defaultHint: theme.name,
                                customHint: '',
                            });
                            router.push('/creer-un-indice/1');
                        }}
                    >
                        {theme.icon}
                        {theme.name}
                    </button>
                ))}
                <button
                    className={styles.themeLink}
                    onClick={() => {
                        onCreateActivity('indice', isPelico);
                        router.push('/creer-un-indice/1');
                    }}
                >
                    Créer un indice sur un autre thème
                </button>
            </div>
        </PageContainer>
    );
}
