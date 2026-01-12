'use client';

import * as React from 'react';

import { getFromSessionStorage, setToSessionStorage, UPDATE_EVENT_NAME } from './session-storage';

export function useSessionStorage<T>(key: string, initialValue: T): [T, (newItem: T) => void, boolean] {
    const [isLoading, setIsLoading] = React.useState(true);
    const item = React.useSyncExternalStore(
        (callback) => {
            window.addEventListener('storage', callback); // cross-tab events
            window.addEventListener(UPDATE_EVENT_NAME, callback); // same-page events
            return () => {
                window.removeEventListener('storage', callback);
                window.removeEventListener(UPDATE_EVENT_NAME, callback);
            };
        },
        () => {
            if (isLoading) {
                setIsLoading(false);
            }
            return (getFromSessionStorage(key) as T) || initialValue;
        },
        () => initialValue,
    );

    const setItem = React.useCallback(
        (newItem: T) => {
            setToSessionStorage(key, newItem);
        },
        [key],
    );

    return [item, setItem, isLoading];
}
