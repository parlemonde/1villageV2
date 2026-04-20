/* eslint-disable camelcase */
'use server';

import { db } from '@server/database';
import { auth_accounts } from '@server/database/schemas/auth-schemas';
import { users } from '@server/database/schemas/users';
import { PARLEMONDE_SSO_PROVIDER_ID } from '@server/lib/parlemonde-sso-plugin';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { eq, and } from 'drizzle-orm';
import { getExtracted } from 'next-intl/server';

export async function checkSSO(email: string): Promise<ServerActionResponse<string>> {
    const t = await getExtracted('common');
    const ssoProvider = PARLEMONDE_SSO_PROVIDER_ID;
    const result = await db
        .select({
            providers: auth_accounts.providerId,
        })
        .from(auth_accounts)
        .leftJoin(users, eq(users.id, auth_accounts.userId))
        .where(and(eq(users.email, email)));

    if (result.some((r) => r.providers === ssoProvider) && result.every((r) => r.providers !== 'credential')) {
        return { error: { message: t('Veuillez utiliser la connection par classe pour accéder à votre compte.') } };
    }
    return {};
}
