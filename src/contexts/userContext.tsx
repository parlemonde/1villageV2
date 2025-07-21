'use client';

import React from 'react';

import type { User } from '@/server-functions/getCurrentUser';

export const UserContext = React.createContext<{
    user: User | null;
    setUser: (user: User | null) => void;
}>({
    user: null,
    setUser: () => {},
});

interface UserProviderProps {
    initialUser: User | null;
}
export const UserProvider = ({ initialUser, children }: React.PropsWithChildren<UserProviderProps>) => {
    const [user, setUser] = React.useState<User | null>(initialUser);
    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};
