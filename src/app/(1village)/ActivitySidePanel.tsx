'use client';

import { Avatar } from '@frontend/components/Avatar';
import { UserContext } from '@frontend/contexts/userContext';
import type { Activity } from '@server/database/schemas/activities';
import { getActivity } from '@server/entities/activities/get-activity';
import { useParams, usePathname } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';

import styles from './activity-side-panel.module.css';

export const ActivitySidePanel = () => {
    const pathname = usePathname();
    const params = useParams();
    const activityId = Number(params?.id);

    const [activity, setActivity] = useState<Activity | null>(null);

    useEffect(() => {
        if (!activityId || Number.isNaN(activityId)) return;

        const fetchActivity = async () => {
            try {
                const result = await getActivity(activityId);
                setActivity(result);
            } catch (error) {
                console.error('Failed to fetch activity:', error);
            }
        };

        fetchActivity();
    }, [activityId]);

    const isOnActivityPage = pathname.startsWith('/activities/');

    const { user, classroom } = useContext(UserContext);

    const isPelico = user?.role === 'admin' || user?.role === 'mediator';
    //const isMediator = user !== null && user.type <= UserType.MEDIATOR;

    if (!isOnActivityPage) {
        return null;
    }

    if (isPelico) {
        return (
            <div className={styles.activitySidePanel}>
                <Avatar user={user} classroom={classroom} isPelico={isPelico} size="sm" isLink={false} />
                <span className="text">
                    <strong>Pélico</strong>
                </span>
            </div>
        );
    }
};
