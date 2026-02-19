'use client';

import { FamilyProvider } from '@frontend/contexts/familyContext';
import { UserContext } from '@frontend/contexts/userContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Activity } from '@server/database/schemas/activities';
import { useContext } from 'react';
import useSWR from 'swr';

export default function FamillesLayout({ children }: { children: React.ReactNode }) {
    const { classroom } = useContext(UserContext);
    const { village } = useContext(VillageContext);

    const { data: hiddenActivities, isLoading } = useSWR<Activity[]>(
        village
            ? `/api/activities${serializeToQueryUrl({
                  villageId: village.id,
                  visibility: 'hidden',
              })}`
            : null,
        jsonFetcher,
    );

    if (isLoading) {
        return null;
    }

    return (
        <FamilyProvider
            showOnlyClassroomActivities={!!classroom?.showOnlyClassroomActivities}
            hiddenActivities={hiddenActivities?.map((a) => a.id)}
            students={[]}
        >
            {children}
        </FamilyProvider>
    );
}
