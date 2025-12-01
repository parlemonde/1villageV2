'use client';

import isEqual from 'react-fast-compare';

export const UPDATE_EVENT_NAME = 'session-storage-update';

const sessionStorageCache: Record<string, unknown> = {};

export function getFromSessionStorage(key: string): unknown | undefined {
    try {
        const sessionItemStr = sessionStorage.getItem(key);
        const sessionItem = sessionItemStr ? JSON.parse(sessionItemStr) : undefined;
        if (isEqual(sessionStorageCache[key], sessionItem)) {
            return sessionStorageCache[key];
        }
        sessionStorageCache[key] = sessionItem;
        return sessionItem;
    } catch {
        return undefined;
    }
}

export function setToSessionStorage<T>(key: string, item: T) {
    try {
        sessionStorage.setItem(key, JSON.stringify(item));
        sessionStorageCache[key] = item;
        const event = new Event(UPDATE_EVENT_NAME);
        window.dispatchEvent(event);
    } catch {
        // do nothing...
    }
}

export function deleteFromSessionStorage(key: string) {
    try {
        sessionStorage.removeItem(key);
        sessionStorageCache[key] = undefined;
        const event = new Event(UPDATE_EVENT_NAME);
        window.dispatchEvent(event);
    } catch {
        // do nothing...
    }
}
