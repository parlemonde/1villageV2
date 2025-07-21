/**
 * Register service: Stores instances in `global` to prevent memory leaks in development.
 * Should be used by server functions only.
 *
 */
export const registerService = <T>(name: string, initFn: () => T): T => {
    if (process.env.NODE_ENV !== 'production') {
        if (!(name in global)) {
            (global as Record<string, unknown>)[name] = initFn();
        }
        return (global as Record<string, unknown>)[name] as T;
    }
    return initFn();
};
