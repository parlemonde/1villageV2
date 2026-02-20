'use client';

import { FamilyProvider } from '@frontend/contexts/familyContext';
import { UserContext } from '@frontend/contexts/userContext';
import { jsonFetcher } from '@lib/json-fetcher';
import type { Student } from '@server/database/schemas/students';
import { useContext } from 'react';
import useSWR from 'swr';

export default function FamillesLayout({ children }: { children: React.ReactNode }) {
    const { classroom } = useContext(UserContext);

    const { data: students, isLoading: isLoadingStudents } = useSWR<Student[]>('/api/students', jsonFetcher);

    if (isLoadingStudents) {
        return null;
    }

    return (
        <FamilyProvider
            showOnlyClassroomActivities={!!classroom?.showOnlyClassroomActivities}
            activityVisibilityMap={{}}
            students={students?.map((s) => {
                const name = s.name.split(' ');
                return { id: s.id, tempId: s.id.toString(), firstName: name[0], lastName: name[1] };
            })}
        >
            {children}
        </FamilyProvider>
    );
}
