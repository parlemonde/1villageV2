/* eslint-disable camelcase */
import { db } from '@server/database';
import { auth_accounts } from '@server/database/schemas/auth-schemas';
import { eq } from 'drizzle-orm';

/**
 * Check if a user has only SSO authentication (no credential/email-password auth)
 */
export const isSSOUser = async (userId: string): Promise<boolean> => {
    const accounts = await db.query.auth_accounts.findMany({
        where: eq(auth_accounts.userId, userId),
        columns: {
            providerId: true,
        },
    });

    return accounts.length > 0 && !accounts.some((account) => account.providerId === 'credential');
};
