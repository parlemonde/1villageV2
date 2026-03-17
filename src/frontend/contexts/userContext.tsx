'use client';

import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import React from 'react';

export const UserContext = React.createContext<{
    user: User;
    setUser: (user: User) => void;
    classroom: Classroom | undefined;
    setClassroom: (classroom: Classroom | undefined) => void;
    classrooms: Classroom[];
    setClassrooms: (classrooms: Classroom[]) => void;
}>({
    user: {
        id: '',
        name: '',
        email: '',
        role: 'teacher',
        image: null,
        firstLogin: 0,
    },
    setUser: () => {},
    classroom: undefined,
    setClassroom: () => {},
    classrooms: [],
    setClassrooms: () => {},
});

interface UserProviderProps {
    initialUser: User;
    initialClassroom?: Classroom;
    initialClassrooms?: Classroom[];
}
export const UserProvider = ({ initialUser, initialClassroom, initialClassrooms = [], children }: React.PropsWithChildren<UserProviderProps>) => {
    const [user, setUser] = React.useState<User>(initialUser);
    const [classroom, setClassroom] = React.useState<Classroom | undefined>(initialClassroom);
    const [classrooms, setClassrooms] = React.useState<Classroom[]>(initialClassrooms);
    const value = React.useMemo(
        () => ({ user, setUser, classroom, setClassroom, classrooms, setClassrooms }),
        [user, setUser, classroom, setClassroom, classrooms, setClassrooms],
    );
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
