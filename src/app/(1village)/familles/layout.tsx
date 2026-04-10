'use client';

import { FamilyProvider } from '@frontend/contexts/familyContext';
import { jsonFetcher } from '@lib/json-fetcher';
import type { Student } from '@server/database/schemas/students';
import useSWR from 'swr';

import { useDefaultParentInvitationMessage } from './3/page';

export default function FamillesLayout({ children }: { children: React.ReactNode }) {
    // const { classroom } = useContext(UserContext);

    const { data: students, isLoading: isLoadingStudents } = useSWR<Student[]>('/api/students', jsonFetcher, { keepPreviousData: true });

    const defaultMessage = useDefaultParentInvitationMessage();

    if (isLoadingStudents) {
        return null;
    }

    return (
        <FamilyProvider
            showOnlyClassroomActivities={/*!!classroom?.showOnlyClassroomActivities*/ true} // TODO migration
            students={students?.map((s) => {
                const name = s.name.split(' ');
                return { id: s.id, tempId: s.id.toString(), firstName: name[0], lastName: name[1] };
            })}
            parentInvitationMessage={/* classroom?.parentInvitationMessage ??*/ defaultMessage}
        >
            {children}
        </FamilyProvider>
    );
}
