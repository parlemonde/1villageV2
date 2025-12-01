'use client';

import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import type { Village } from '@server/database/schemas/villages';
import React, { createContext, useMemo } from 'react';
import useSWR from 'swr';

export const VillageContext = createContext<{
    village: Village | undefined;
    usersMap: Partial<Record<string, User>>;
    classroomsMap: Partial<Record<number, Classroom>>;
}>({
    village: undefined,
    usersMap: {},
    classroomsMap: {},
});

interface VillageProviderProps {
    village: Village | undefined;
}
export const VillageProvider = ({ village, children }: React.PropsWithChildren<VillageProviderProps>) => {
    const { data: users } = useSWR<User[]>(village ? `/api/users${serializeToQueryUrl({ villageId: village.id })}` : null, jsonFetcher);
    const { data: classrooms } = useSWR<Classroom[]>(
        village ? `/api/classrooms${serializeToQueryUrl({ villageId: village.id })}` : null,
        jsonFetcher,
    );
    const usersMap: Partial<Record<string, User>> = React.useMemo(() => Object.fromEntries(users?.map((user) => [user.id, user]) ?? []), [users]);
    const classroomsMap: Partial<Record<number, Classroom>> = React.useMemo(
        () => Object.fromEntries(classrooms?.map((classroom) => [classroom.id, classroom]) ?? []),
        [classrooms],
    );

    const value = useMemo(() => ({ village, usersMap, classroomsMap }), [village, usersMap, classroomsMap]);
    return <VillageContext.Provider value={value}>{children}</VillageContext.Provider>;
};
