/* eslint-disable no-debugger */
'use client';

import { WorldMap } from '@frontend/components/WorldMap';
import { ActivityView } from '@frontend/components/activities/ActivityView';
import { Button } from '@frontend/components/ui/Button';
import { jsonFetcher } from '@lib/json-fetcher';
import type { Activity } from '@server/database/schemas/activities';
import type { User } from '@server/database/schemas/users';
import { useParams, usePathname } from 'next/navigation';
import useSWR from 'swr';

import styles from './activity-side-panel.module.css';

export const ActivitySidePanel = () => {
    //const { user } = useContext(UserContext);
    const pathname = usePathname();
    const params = useParams();
    const activityId = Number(params?.id);

    const { data: activity } = useSWR<Activity>(activityId ? `/api/activity/${activityId}` : null, jsonFetcher);
    const { data: activityUser } = useSWR<User>(activity?.userId ? `/api/user/${activity.userId}` : null, jsonFetcher);
    debugger;
    const formatPseudo = activityUser?.name.replace(' ', '-');
    const isMediator = activityUser?.role === 'admin' || activityUser?.role === 'mediator';

    const isOnActivityPage = pathname.startsWith('/activities/');

    if (!isOnActivityPage) return null;

    return (
        <div className={styles.activitySidePanel}>
            <div className={styles.avatar}>
                {activity && <ActivityView activity={activity} showDetails={false} />}
                {isMediator && (
                    <div className={styles.ficheProf}>
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            <Button
                                as="a"
                                href={`https://prof.parlemonde.org/les-professeurs-partenaires/${formatPseudo}/profile`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ overflow: 'hidden', marginBottom: '10px', textAlign: 'center' }}
                                variant="outlined"
                                label="Voir la fiche du professeur"
                            ></Button>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.WorldMapContainer}>
                <WorldMap activity={activity} />
            </div>
        </div>
    );
};
