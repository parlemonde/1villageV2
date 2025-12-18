'use client';

import { ActivityView } from '@frontend/components/activities/ActivityView';
import type { Activity } from '@server/database/schemas/activities';
import { getActivity } from '@server/entities/activities/get-activity';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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

    if (!isOnActivityPage) {
        return null;
    }

    return activity && <ActivityView activity={activity} showDetails={false} />;
};
