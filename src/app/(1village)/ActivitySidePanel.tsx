'use client';

import { WorldMap } from '@frontend/components/WorldMap';
import { ActivityView } from '@frontend/components/activities/ActivityView';
import { useParams, usePathname } from 'next/navigation';
import useSWR from 'swr';

import styles from './activity-side-panel.module.css';

export const ActivitySidePanel = () => {
    const pathname = usePathname();
    const params = useParams();
    const activityId = Number(params?.id);

    const { data: activity } = useSWR(activityId ? `/api/activity/${activityId}` : null, (url) => fetch(url).then((res) => res.json()));

    const isOnActivityPage = pathname.startsWith('/activities/');

    if (!isOnActivityPage) return null;

    return (
        <div className={styles.activitySidePanel}>
            {activity && <ActivityView activity={activity} showDetails={false} />}
            <div className={styles.WorldMapContainer}>
                <WorldMap />
            </div>
        </div>
    );
};
