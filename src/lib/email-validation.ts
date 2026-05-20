/**
 * Validates email format using a simple regex pattern.
 * This is a synchronous, cross-layer utility that can be used in both
 * frontend and server contexts.
 *
 * For async email validation (e.g., database checks), create a separate
 * server-only function in @server/lib.
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
