'use client';

import React from 'react';

import type { User } from '@/server-functions/getCurrentUser';

export const UserContext = React.createContext<{
    user: User;
    setUser: (user: User) => void;
}>({
    user: {
        id: 0,
        name: '',
        email: '',
    },
    setUser: () => {},
});

interface UserProviderProps {
    initialUser: User;
}
export const UserProvider = ({ initialUser, children }: React.PropsWithChildren<UserProviderProps>) => {
    const [user, setUser] = React.useState<User>(initialUser);
    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};
