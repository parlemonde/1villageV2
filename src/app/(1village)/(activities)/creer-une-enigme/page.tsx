'use client';

import { PageContainer } from '@frontend/components/ui/PageContainer';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import EvenementIcon from '@frontend/svg/enigmes/evenement-mystere.svg';
import LocalisationIcon from '@frontend/svg/enigmes/localisation-mystere.svg';
import ObjetIcon from '@frontend/svg/enigmes/objet-mystere.svg';
import PersonaliteIcon from '@frontend/svg/enigmes/personalite-mystere.svg';
import { useRouter } from 'next/navigation';
import React from 'react';

import styles from './page.module.css';

export const DEFAULT_PUZZLES: {
    name: string;
    icon: React.ReactNode;
}[] = [
    { name: 'Objet mystère', icon: <ObjetIcon /> },
    { name: 'Évènement mystère', icon: <EvenementIcon /> },
    { name: 'Personnalité mystère', icon: <PersonaliteIcon /> },
    { name: 'Lieu mystère', icon: <LocalisationIcon /> },
];

export default function CreerUneEnigmePage() {
    const router = useRouter();
    const { user } = React.useContext(UserContext);
    const { onCreateActivity } = React.useContext(ActivityContext);
    const isPelico = user.role === 'admin' || user.role === 'mediator';
    return (
        <PageContainer title="Sur quelle thématique sera votre énigme ?">
            <div className={styles.themesContainer}>
                {DEFAULT_PUZZLES.map((theme) => (
                    <button
                        key={theme.name}
                        className={styles.themeLink}
                        onClick={() => {
                            onCreateActivity('enigme', isPelico, {
                                defaultPuzzle: theme.name,
                            });
                            router.push('/creer-une-enigme/1');
                        }}
                    >
                        {theme.icon}
                        {theme.name}
                    </button>
                ))}
                <button
                    className={styles.themeLink}
                    onClick={() => {
                        onCreateActivity('enigme', isPelico);
                        router.push('/creer-une-enigme/1');
                    }}
                >
                    Créer une énigme sur un autre thème
                </button>
            </div>
        </PageContainer>
    );
}
