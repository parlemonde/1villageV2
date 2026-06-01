'use server';

import { db } from '@server/database';
import { type User, users } from '@server/database/schemas/users';
import { auth } from '@server/lib/auth';
import { checkSSO } from '@server/lib/check-sso';
import { getStringValue } from '@server/lib/get-string-value';
import { isAPIError } from 'better-auth/api';
import { eq } from 'drizzle-orm';
import { redirect, RedirectType } from 'next/navigation';
import { getExtracted } from 'next-intl/server';

export async function login(_previousState: string, formData: FormData): Promise<string> {
    const t = await getExtracted('common');
    const email = getStringValue(formData.get('email'));
    const password = getStringValue(formData.get('password'));
    const response = await checkSSO(email);

    if (response.error?.message) {
        return response.error.message;
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
    } catch (error) {
        if (isAPIError(error)) {
            if (error.body?.code === 'EMAIL_NOT_VERIFIED') {
                const [row] = await db.select({ role: users.role }).from(users).where(eq(users.email, email)).limit(1);
                if (row?.role === 'parent') {
                    await auth.api.sendVerificationEmail({
                        body: { email, callbackURL: '/' },
                    });
                    redirect('/login/famille/verify-email');
                }
            }
        }
        return t('Identifiants invalides.');
    }
    redirect(user.role === 'admin' ? '/admin' : '/', RedirectType.push);
}
