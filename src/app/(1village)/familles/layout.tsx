'use client';

import { FamilyProvider } from '@frontend/contexts/familyContext';
import { UserContext } from '@frontend/contexts/userContext';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { ClassroomPreferences } from '@server/database/schemas/classroom-preferences';
import type { Student } from '@server/database/schemas/students';
import { useContext } from 'react';
import useSWR from 'swr';

import { useDefaultParentInvitationMessage } from './3/page';

export default function FamillesLayout({ children }: { children: React.ReactNode }) {
    const { classroom } = useContext(UserContext);

    const { data: students, isLoading: isLoadingStudents } = useSWR<Student[]>('/api/students', jsonFetcher, { keepPreviousData: true });
    const { data: preferences, isLoading: isLoadingPreferences } = useSWR<Partial<ClassroomPreferences>>(
        `/api/classroom-preferences${serializeToQueryUrl({ keys: ['parentInvitationMessage'] })}`,
        jsonFetcher,
        { keepPreviousData: true },
    );

    const defaultMessage = useDefaultParentInvitationMessage();

    if (isLoadingStudents || isLoadingPreferences) {
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
            parentInvitationMessage={preferences?.parentInvitationMessage ?? defaultMessage}
        >
            {children}
        </FamilyProvider>
    );
}
