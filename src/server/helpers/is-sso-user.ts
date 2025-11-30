/* eslint-disable camelcase */
import { db } from '@server/database';
import { auth_accounts } from '@server/database/schemas/auth-schemas';
import { and, count, eq, ne } from 'drizzle-orm';

/**
 * Check if a user has only SSO authentication (no credential/email-password auth)
 */
export const isSSOUser = async (userId: string): Promise<boolean> => {
    const result = await db
        .select({ count: count() })
        .from(auth_accounts)
        .where(and(eq(auth_accounts.userId, userId), ne(auth_accounts.providerId, 'credential')));

    return result[0].count > 0;
};
