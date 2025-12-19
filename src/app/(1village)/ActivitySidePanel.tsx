'use client';

import { ActivityView } from '@frontend/components/activities/ActivityView';
import { useParams, usePathname } from 'next/navigation';
import useSWR from 'swr';

export const ActivitySidePanel = () => {
    const pathname = usePathname();
    const params = useParams();
    const activityId = Number(params?.id);

    const { data: activity } = useSWR(activityId ? `/api/activity/${activityId}` : null, (url) => fetch(url).then((res) => res.json()));

    const isOnActivityPage = pathname.startsWith('/activities/');

    if (!isOnActivityPage) return null;

    return activity && <ActivityView activity={activity} showDetails={false} />;
};
