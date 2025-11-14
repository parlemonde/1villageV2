'use client';

import { ActivityCard } from '@frontend/components/activities/ActivityCard';
import { VillageContext } from '@frontend/contexts/villageContext';
import { usePhase } from '@frontend/hooks/usePhase';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Activity } from '@server/database/schemas/activities';
import { useContext } from 'react';
import useSWR from 'swr';
import { ActivityFilters } from './ActivityFilters';

export const Activities = () => {
    const { village, usersMap, classroomsMap } = useContext(VillageContext);
    const [phase] = usePhase();
    const { data: activities } = useSWR<Activity[]>(
        village
            ? `/api/activities${serializeToQueryUrl({
                  phase,
                  villageId: village.id,
              })}`
            : null,
        jsonFetcher,
    );

    return (
        <div>
            <ActivityFilters />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activities?.map((activity) => (
                    <ActivityCard
                        key={activity.id}
                        activity={activity}
                        user={usersMap[activity.userId]}
                        classroom={activity.classroomId !== null ? classroomsMap[activity.classroomId] : undefined}
                    />
                ))}
            </div>
        </div>
    );
};
