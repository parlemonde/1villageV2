'use client';

import type { ClassroomVillageTeacher } from '@app/api/classrooms/route';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { User } from '@server/database/schemas/users';
import type { Village } from '@server/database/schemas/villages';
import React, { createContext, useCallback, useMemo } from 'react';
import useSWR from 'swr';

export const VillageContext = createContext<{
    village: Village | undefined;
    usersMap: Partial<Record<string, User>>;
    classroomsMap: Partial<Record<number, ClassroomVillageTeacher>>;
    invalidateClassrooms: () => void;
}>({
    village: undefined,
    usersMap: {},
    classroomsMap: {},
    invalidateClassrooms: () => {},
});

interface VillageProviderProps {
    village: Village | undefined;
}
export const VillageProvider = ({ village, children }: React.PropsWithChildren<VillageProviderProps>) => {
    const { data: users } = useSWR<User[]>(village ? `/api/users${serializeToQueryUrl({ villageId: village.id })}` : null, jsonFetcher);

    const { data: classrooms, mutate } = useSWR<ClassroomVillageTeacher[]>(
        village ? `/api/classrooms${serializeToQueryUrl({ villageId: village.id })}` : null,
        jsonFetcher,
    );

    const invalidateClassrooms = useCallback(() => {
        mutate();
    }, [mutate]);

    const usersMap: Partial<Record<string, User>> = React.useMemo(() => Object.fromEntries(users?.map((user) => [user.id, user]) ?? []), [users]);
    const classroomsMap: Partial<Record<number, ClassroomVillageTeacher>> = React.useMemo(
        () => Object.fromEntries(classrooms?.map((classroom) => [classroom.classroom.id, classroom]) ?? []),
        [classrooms],
    );

    const value = useMemo(
        () => ({ village, usersMap, classroomsMap, invalidateClassrooms }),
        [village, usersMap, classroomsMap, invalidateClassrooms],
    );
    return <VillageContext.Provider value={value}>{children}</VillageContext.Provider>;
};
