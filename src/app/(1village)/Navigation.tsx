import classNames from 'clsx';
import React from 'react';

import styles from './navigation.module.css';
import { CountryFlag } from '@/components/CountryFlag';

export const Navigation = () => {
    return (
        <div className={styles.navigationWrapper}>
            <div className={styles.test}>
                <div className={classNames(styles.navigationCard, styles.navigationCardTitle)}>
                    <strong>Village-monde</strong>
                    <CountryFlag country="fr" />
                    <CountryFlag isMystery />
                </div>
                <div className={styles.navigationCard} style={{ marginTop: '16px' }}>
                    <nav>foo</nav>
                </div>
            </div>
        </div>
    );
};
