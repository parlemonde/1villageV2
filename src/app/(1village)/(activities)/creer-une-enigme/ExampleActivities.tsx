'use client';

import { ActivityCard } from '@frontend/components/activities/ActivityCard';
import { Title } from '@frontend/components/ui/Title';
import { VillageContext } from '@frontend/contexts/villageContext';
import PelicoSearch from '@frontend/svg/pelico/pelico-search.svg';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Activity } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
import { useContext } from 'react';
import useSWR from 'swr';

import type { ThemeName } from './enigme-constants';

interface ExampleActivitiesProps {
    activityType: ActivityType;
    theme?: ThemeName;
}

export default function ExampleActivities({ activityType, theme }: ExampleActivitiesProps) {
    const { village, usersMap, classroomsMap } = useContext(VillageContext);
    const { data: allActivities = [] } = useSWR<Activity[]>(
        village
            ? `/api/activities${serializeToQueryUrl({
                  villageId: village.id,
                  countries: village.countries,
                  isPelico: true,
                  type: [activityType],
              })}`
            : null,
        jsonFetcher,
        {
            keepPreviousData: true,
        },
    );
    const activities = allActivities.filter((a) => a.type === activityType && a.data?.defaultTheme === theme);

    return (
        <>
            <Title variant="h2" marginTop={60} marginBottom="md">
                {<span>Énigmes des pélicopains sur ce thème :</span>}
            </Title>
            <>
                {activities.map((activity) => (
                    <ActivityCard
                        key={activity.id}
                        activity={activity}
                        user={usersMap[activity.userId]}
                        classroom={activity.classroomId ? classroomsMap[activity.classroomId] : undefined}
                    />
                ))}
                {activities.length === 0 && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            marginBottom: '32px',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px dashed var(--grey-300)',
                            padding: '32px',
                            borderRadius: '4px',
                        }}
                    >
                        <PelicoSearch style={{ width: '100px', height: 'auto' }} />
                        <p>
                            Aucune énigme trouvée pour le thème <strong>{theme}</strong>.
                        </p>
                    </div>
                )}
            </>
        </>
    );
}
