'use client';

import { ActivityCard } from '@frontend/activities/ActivityCard';
import { VillageContext } from '@frontend/contexts/villageContext';
import { usePhase } from '@frontend/hooks/usePhase';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Activity } from '@server/database/schemas/activities';
import { useContext } from 'react';
import useSWR from 'swr';

const Filters = () => {
    return (
        <div>
            <strong>Filtres:</strong>
        </div>
    );
};

export const Activities = () => {
    const { village } = useContext(VillageContext);
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
            <Filters />
            {activities?.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
            ))}
        </div>
    );
};
