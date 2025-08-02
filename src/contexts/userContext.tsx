'use client';

import React from 'react';

import type { Classroom } from '@/database/schemas/classrooms';
import type { User } from '@/database/schemas/users';

export const UserContext = React.createContext<{
    user: User;
    setUser: (user: User) => void;
    classroom: Classroom | undefined;
}>({
    user: {
        id: 0,
        name: '',
        email: '',
        role: 'teacher',
    },
    setUser: () => {},
    classroom: undefined,
});

interface UserProviderProps {
    initialUser: User;
    classroom: Classroom | undefined;
}
export const UserProvider = ({ initialUser, classroom, children }: React.PropsWithChildren<UserProviderProps>) => {
    const [user, setUser] = React.useState<User>(initialUser);
    const value = React.useMemo(() => ({ user, setUser, classroom }), [user, setUser, classroom]);
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
