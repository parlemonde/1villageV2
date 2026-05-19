'use server';

import { type User } from '@server/database/schemas/users';
import { auth } from '@server/lib/auth';
import { checkSSO } from '@server/lib/check-sso';
import { getStringValue } from '@server/lib/get-string-value';
import { isAPIError } from 'better-auth/api';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
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
                const cookieStore = await cookies();
                cookieStore.set('pendingEmail', email);
                redirect('/api/verify-email?fromLogin=true');
            }
        }
        return t('Identifiants invalides.');
    }
    redirect(user.role === 'admin' ? '/admin' : '/', RedirectType.push);
}
