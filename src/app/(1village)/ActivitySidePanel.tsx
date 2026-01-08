'use client';

import { WorldMap } from '@frontend/components/WorldMap';
import { ActivityView } from '@frontend/components/activities/ActivityView';
import { Button } from '@frontend/components/ui/Button';
import { UserContext } from '@frontend/contexts/userContext';
import { useParams, usePathname } from 'next/navigation';
import { useContext } from 'react';
import useSWR from 'swr';

import styles from './activity-side-panel.module.css';

export const ActivitySidePanel = () => {
    const { user } = useContext(UserContext);
    const pathname = usePathname();
    const params = useParams();
    const activityId = Number(params?.id);
    const formatPseudo = user.name.replace(' ', '-');

    const isMediator = user?.role === 'admin' || user?.role === 'mediator';

    const { data: activity } = useSWR(activityId ? `/api/activity/${activityId}` : null, (url) => fetch(url).then((res) => res.json()));

    const isOnActivityPage = pathname.startsWith('/activities/');

    if (!isOnActivityPage) return null;

    return (
        <div className={styles.activitySidePanel}>
            <div className={styles.avatar}>{activity && <ActivityView activity={activity} showDetails={false} />}
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
