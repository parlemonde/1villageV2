'use client';

import { Title } from '@frontend/components/ui/Title';

import styles from './last-activities.module.css';

export const LastActivities = () => {
    return (
        <div className={styles.container}>
            <Title variant="h3" marginBottom="sm">
                Dernières activités
            </Title>
        </div>
    );
};
