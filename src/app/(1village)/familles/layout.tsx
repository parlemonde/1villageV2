'use client';

import { FamilyProvider } from '@frontend/contexts/familyContext';
import { UserContext } from '@frontend/contexts/userContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Activity } from '@server/database/schemas/activities';
import type { Student } from '@server/database/schemas/students';
import { useContext } from 'react';
import useSWR from 'swr';

export default function FamillesLayout({ children }: { children: React.ReactNode }) {
    const { classroom } = useContext(UserContext);
    const { village } = useContext(VillageContext);

    const { data: hiddenActivities, isLoading: isLoadingActivities } = useSWR<Activity[]>(
        village
            ? `/api/activities${serializeToQueryUrl({
                  villageId: village.id,
                  visibility: 'hidden',
              })}`
            : null,
        jsonFetcher,
    );

    const { data: students, isLoading: isLoadingStudents } = useSWR<Student[]>('/api/students', jsonFetcher);

    if (isLoadingActivities || isLoadingStudents) {
        return null;
    }

    return (
        <FamilyProvider
            showOnlyClassroomActivities={!!classroom?.showOnlyClassroomActivities}
            hiddenActivities={hiddenActivities?.map((a) => a.id)}
            students={students?.map((s) => {
                const name = s.name.split(' ');
                return { id: s.id, tempId: s.id.toString(), firstName: name[0], lastName: name[1] };
            })}
        >
            {children}
        </FamilyProvider>
    );
}
