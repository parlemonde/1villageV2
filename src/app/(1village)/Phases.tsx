'use client';

import classNames from 'clsx';
import React, { useState } from 'react';

import styles from './phases.module.css';
import Jumelles from '@/svg/phases/jumelles.svg';
import Puzzle from '@/svg/phases/puzzle.svg';
import Step2 from '@/svg/phases/step2.svg';

export const Phases = () => {
    const [activePhase, setActivePhase] = useState(1);
    return (
        <div className={styles.phases}>
            <button
                className={classNames(styles.phaseContainer, { [styles.phaseContainerActive]: activePhase === 1 })}
                onClick={() => setActivePhase(1)}
            >
                <div className={styles.phase}>
                    <Jumelles className={styles.phaseIcon} /> Phase 1 - Découvrir
                </div>
                <svg viewBox="0 0 32 46" className={styles.phaseArrow}>
                    <path d="M32 23L0 46L0 0L32 23Z" fill="currentColor" />
                </svg>
            </button>
            <button
                className={classNames(styles.phaseContainer, { [styles.phaseContainerActive]: activePhase === 2 })}
                onClick={() => setActivePhase(2)}
            >
                <div className={styles.phase}>
                    <Step2 className={styles.phaseIcon} /> Phase 2 - Échanger
                </div>
                <svg viewBox="0 0 32 46" className={styles.phaseArrow}>
                    <path d="M32 23L0 46L0 0L32 23Z" fill="currentColor" />
                </svg>
            </button>
            <button
                className={classNames(styles.phaseContainer, { [styles.phaseContainerActive]: activePhase === 3 })}
                onClick={() => setActivePhase(3)}
            >
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
