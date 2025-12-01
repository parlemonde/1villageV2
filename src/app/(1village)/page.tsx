'use client';

import { WorldMap } from '@frontend/components/WorldMap';
import { Button } from '@frontend/components/ui/Button';
import { Title } from '@frontend/components/ui/Title';
import { VillageContext } from '@frontend/contexts/villageContext';
import { usePhase } from '@frontend/hooks/usePhase';
import PelicoReflechit from '@frontend/svg/pelico/pelico-reflechit.svg';
import { useContext } from 'react';

import { Activities } from './Activities';
import styles from './page.module.css';

export default function Home() {
    const { village } = useContext(VillageContext);
    const [phase] = usePhase();

    if (phase === null || village === undefined) {
        return null;
    }
    if (phase > village.activePhase) {
        return (
            <div style={{ margin: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', textAlign: 'center' }}>
                <Title variant="h2">Un peu de patience, la phase {phase} n&apos;a pas encore débuté !</Title>
                <PelicoReflechit style={{ width: '400px', maxWidth: 'calc(100% - 32px)', height: 'auto' }} />
                <Button
                    as="a"
                    href="/"
                    color="primary"
                    variant="outlined"
                    isUpperCase={false}
                    label={`Retourner à l'accueil de la phase ${village.activePhase}`}
                />
            </div>
        );
    }

    return (
        <>
            <div className={styles.WordMapContainer}>
                <WorldMap />
            </div>
            <div style={{ margin: '8px 16px 32px 16px' }}>
                <Title marginBottom="sm">Dernières activités</Title>
                <Activities />
            </div>
        </>
    );
}
