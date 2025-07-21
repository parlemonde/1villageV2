'use client';

import * as React from 'react';

import { getFromLocalStorage, setToLocalStorage, UPDATE_EVENT_NAME } from './local-storage';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (newItem: T) => void, boolean] {
    const isLoadingRef = React.useRef(true);
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
            isLoadingRef.current = false;
            return (getFromLocalStorage(key) as T) || initialValue;
        },
        () => initialValue,
    );

    const setItem = React.useCallback(
        (newItem: T) => {
            setToLocalStorage(key, newItem);
        },
        [key],
    );

    return [item, setItem, isLoadingRef.current];
}
