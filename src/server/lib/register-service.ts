/**
 * Register service: Stores instances in `global` to prevent memory leaks in development and production.
 * Should be used by server functions only.
 *
 */
export const registerService = <T>(name: string, initFn: () => T): T => {
    if (!(name in global)) {
        (global as Record<string, unknown>)[name] = initFn();
    }
    return (global as Record<string, unknown>)[name] as T;
};
