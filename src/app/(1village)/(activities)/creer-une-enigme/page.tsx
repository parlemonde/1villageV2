'use client';

import { useEnigmeThemes } from '@app/(1village)/(activities)/creer-une-enigme/enigme-constants';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { useRouter } from 'next/navigation';
import React from 'react';

import styles from './page.module.css';

export default function CreerUneEnigmePage() {
    const router = useRouter();
    const { user } = React.useContext(UserContext);
    const { onCreateActivity } = React.useContext(ActivityContext);
    const isPelico = user.role === 'admin' || user.role === 'mediator';
    const DEFAULT_THEMES = useEnigmeThemes();

    return (
        <PageContainer title="Sur quelle thématique sera votre énigme ?">
            <div className={styles.themesContainer}>
                {DEFAULT_THEMES.map((theme, index) => (
                    <button
                        key={index}
                        className={styles.themeLink}
                        onClick={() => {
                            onCreateActivity('enigme', isPelico, {
                                defaultTheme: theme.name,
                            });
                            router.push('/creer-une-enigme/1');
                        }}
                    >
                        {theme.icon}
                        {theme.tname}
                    </button>
                ))}
            </div>
        </PageContainer>
    );
}
