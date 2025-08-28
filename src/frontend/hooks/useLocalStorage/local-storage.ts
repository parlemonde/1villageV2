'use client';

import isEqual from 'fast-deep-equal/es6';

export const UPDATE_EVENT_NAME = 'local-storage-update';

const localStorageCache: Record<string, unknown> = {};

export function getFromLocalStorage(key: string): unknown | undefined {
    try {
        const localItemStr = localStorage.getItem(key);
        const localItem = localItemStr ? JSON.parse(localItemStr) : undefined;
        if (isEqual(localStorageCache[key], localItem)) {
            return localStorageCache[key];
        }
        localStorageCache[key] = localItem;
        return localItem;
    } catch {
        return undefined;
    }
}

export function setToLocalStorage<T>(key: string, item: T) {
    try {
        localStorage.setItem(key, JSON.stringify(item));
        localStorageCache[key] = item;
        const event = new Event(UPDATE_EVENT_NAME);
        window.dispatchEvent(event);
    } catch {
        // do nothing...
    }
}

export function deleteFromLocalStorage(key: string) {
    try {
        localStorage.removeItem(key);
        localStorageCache[key] = undefined;
        const event = new Event(UPDATE_EVENT_NAME);
        window.dispatchEvent(event);
    } catch {
        // do nothing...
    }
}
