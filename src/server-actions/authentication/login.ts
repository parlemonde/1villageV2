/* eslint-disable camelcase */
'use server';

import { db } from '@server/database';
import { auth_accounts } from '@server/database/schemas/auth-schemas';
import { users, type User } from '@server/database/schemas/users';
import { auth } from '@server/lib/auth';
import { getStringValue } from '@server/lib/get-string-value';
import { PARLEMONDE_SSO_PROVIDER_ID } from '@server/lib/parlemonde-sso-plugin';
import { eq, and } from 'drizzle-orm';
import { redirect, RedirectType } from 'next/navigation';

export async function login(_previousState: string, formData: FormData): Promise<string> {
    const email = getStringValue(formData.get('email'));
    const password = getStringValue(formData.get('password'));

    const ssoProvider = PARLEMONDE_SSO_PROVIDER_ID;
    const result = await db
        .select({
            providers: auth_accounts.providerId,
        })
        .from(auth_accounts)
        .leftJoin(users, eq(users.id, auth_accounts.userId))
        .where(and(eq(users.email, email)));
    if (result.some((r) => r.providers === ssoProvider) && result.every((r) => r.providers !== 'credential')) {
        return 'Veuillez utiliser la connection par classe pour accéder à votre compte.';
    }

    let user: User | undefined;
    try {
        const result = await auth.api.signInEmail({
            body: {
                email,
                password,
            },
        });
        user = result.user as unknown as User;
    } catch {
        return 'Identifiants invalides.';
    }
    redirect(user.role === 'admin' ? '/admin' : '/', RedirectType.push);
}
