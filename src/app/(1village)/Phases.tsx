'use client';

import { VillageContext } from '@frontend/contexts/villageContext';
import Jumelles from '@frontend/svg/phases/jumelles.svg';
import Puzzle from '@frontend/svg/phases/puzzle.svg';
import Step2 from '@frontend/svg/phases/step2.svg';
import classNames from 'clsx';
import { useContext } from 'react';

import styles from './phases.module.css';

export const Phases = () => {
    const { phase, setPhase } = useContext(VillageContext);
    return (
        <div className={styles.phases}>
            <button className={classNames(styles.phaseContainer, { [styles.phaseContainerActive]: phase === 1 })} onClick={() => setPhase(1)}>
                <div className={styles.phase}>
                    <Jumelles className={styles.phaseIcon} /> Phase 1 - Découvrir
                </div>
                <svg viewBox="0 0 32 46" className={styles.phaseArrow}>
                    <path d="M32 23L0 46L0 0L32 23Z" fill="currentColor" />
                </svg>
            </button>
            <button className={classNames(styles.phaseContainer, { [styles.phaseContainerActive]: phase === 2 })} onClick={() => setPhase(2)}>
                <div className={styles.phase}>
                    <Step2 className={styles.phaseIcon} /> Phase 2 - Échanger
                </div>
                <svg viewBox="0 0 32 46" className={styles.phaseArrow}>
                    <path d="M32 23L0 46L0 0L32 23Z" fill="currentColor" />
                </svg>
            </button>
            <button className={classNames(styles.phaseContainer, { [styles.phaseContainerActive]: phase === 3 })} onClick={() => setPhase(3)}>
                <div className={styles.phase}>
                    <Puzzle className={styles.phaseIcon} /> Phase 3 - Imaginer
                </div>
                <svg viewBox="0 0 32 46" className={styles.phaseArrow}>
                    <path d="M32 23L0 46L0 0L32 23Z" fill="currentColor" />
                </svg>
            </button>
        </div>
    );
};
