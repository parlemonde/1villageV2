'use client';

import { usePathname } from 'next/navigation';

import styles from './activity-side-panel.module.css';

export const ActivitySidePanel = () => {
    const pathname = usePathname();

    const isOnActivityPage = pathname.startsWith('/activities/');

    if (!isOnActivityPage) {
        return null;
    }

    return <div className={styles.activitySidePanel}>ActivitySidePanel</div>;
};
