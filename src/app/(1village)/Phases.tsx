'use client';

import { usePhase } from '@frontend/hooks/usePhase';
import Jumelles from '@frontend/svg/phases/jumelles.svg';
import Puzzle from '@frontend/svg/phases/puzzle.svg';
import Step2 from '@frontend/svg/phases/step2.svg';
import classNames from 'clsx';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

import styles from './phases.module.css';

interface DisplayedPhasesProps {
    isOnRootPage?: boolean;
}
const DisplayedPhases = ({ isOnRootPage }: DisplayedPhasesProps) => {
    const router = useRouter();
    const [phase, setPhase] = usePhase();
    return (
        <div className={styles.phases}>
            <button
                className={classNames(styles.phaseContainer, { [styles.phaseContainerActive]: phase === 1 })}
                onClick={() => {
                    if (!isOnRootPage) {
                        router.push(`/?phase=1`);
                    } else if (phase !== 1) {
                        setPhase(1);
                    }
                }}
            >
                <div className={styles.phase}>
                    <Jumelles className={styles.phaseIcon} /> Phase 1 - Découvrir
                </div>
                <svg viewBox="0 0 32 46" className={styles.phaseArrow}>
                    <path d="M32 23L0 46L0 0L32 23Z" fill="currentColor" />
                </svg>
            </button>
            <button
                className={classNames(styles.phaseContainer, { [styles.phaseContainerActive]: phase === 2 })}
                onClick={() => {
                    if (!isOnRootPage) {
                        router.push(`/?phase=2`);
                    } else if (phase !== 2) {
                        setPhase(2);
                    }
                }}
            >
                <div className={styles.phase}>
                    <Step2 className={styles.phaseIcon} /> Phase 2 - Échanger
                </div>
                <svg viewBox="0 0 32 46" className={styles.phaseArrow}>
                    <path d="M32 23L0 46L0 0L32 23Z" fill="currentColor" />
                </svg>
            </button>
            <button
                className={classNames(styles.phaseContainer, { [styles.phaseContainerActive]: phase === 3 })}
                onClick={() => {
                    if (!isOnRootPage) {
                        router.push(`/?phase=3`);
                    } else if (phase !== 3) {
                        setPhase(3);
                    }
                }}
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

const ROUTES_WITH_PHASES = [/^\/$/, /^\/activities($|\/)/];

export const Phases = () => {
    const pathname = usePathname();
    const isOnRouteWithPhases = ROUTES_WITH_PHASES.some((route) => route.test(pathname));
    if (!isOnRouteWithPhases) {
        return null;
    }
    return <DisplayedPhases isOnRootPage={pathname === '/'} />;
};
