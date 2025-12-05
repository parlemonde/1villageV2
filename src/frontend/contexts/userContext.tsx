'use client';

import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import React from 'react';

export const UserContext = React.createContext<{
    user: User;
    setUser: (user: User) => void;
    classroom: Classroom | undefined;
    setClassroom: (classroom: Classroom | undefined) => void;
}>({
    user: {
        id: '',
        name: '',
        email: '',
        role: 'teacher',
        image: null,
    },
    setUser: () => {},
    classroom: undefined,
    setClassroom: () => {},
});

interface UserProviderProps {
    initialUser: User;
    initialClassroom?: Classroom;
}
export const UserProvider = ({ initialUser, initialClassroom, children }: React.PropsWithChildren<UserProviderProps>) => {
    const [user, setUser] = React.useState<User>(initialUser);
    const [classroom, setClassroom] = React.useState<Classroom | undefined>(initialClassroom);
    const value = React.useMemo(() => ({ user, setUser, classroom, setClassroom }), [user, setUser, classroom, setClassroom]);
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
