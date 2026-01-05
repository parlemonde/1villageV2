'use client';

import { ActivityCard } from '@frontend/components/activities/ActivityCard';
import { ActivityFilters, type ActivityFiltersState } from '@frontend/components/activities/ActivityFilters/ActivityFilters';
import { VillageContext } from '@frontend/contexts/villageContext';
import { usePhase } from '@frontend/hooks/usePhase';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Activity } from '@server/database/schemas/activities';
import React, { useContext, useState } from 'react';
import useSWR from 'swr';

export const Activities = () => {
    const { village, usersMap, classroomsMap } = useContext(VillageContext);
    const [phase] = usePhase();
    const [filters, setFilters] = useState<ActivityFiltersState>({
        activityTypes: [], // Empty array -> all activity types
        countries: village?.countries ?? [],
        isPelico: true,
        search: '',
    });

    const { data: activities } = useSWR<Activity[]>(
        village
            ? `/api/activities${serializeToQueryUrl({
                  phase,
                  villageId: village.id,
                  countries: filters.countries,
                  isPelico: filters.isPelico,
                  search: filters.search,
                  type: filters.activityTypes,
              })}`
            : null,
        jsonFetcher,
        {
            keepPreviousData: true,
        },
    );

    return (
        <div>
            <ActivityFilters filters={filters} setFilters={setFilters} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activities?.map((activity) => (
                    <ActivityCard
                        key={activity.id}
                        activity={activity}
                        user={usersMap[activity.userId]}
                        classroom={activity.classroomId !== null ? classroomsMap[activity.classroomId]?.classroom : undefined}
                    />
                ))}
            </div>
        </div>
    );
};
