'use server';

import { type User } from '@server/database/schemas/users';
import { auth } from '@server/lib/auth';
import { getStringValue } from '@server/lib/get-string-value';
import { redirect, RedirectType } from 'next/navigation';

import { checkSSO } from './check-sso';

export async function login(_previousState: string, formData: FormData): Promise<string> {
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
    } catch {
        return 'Identifiants invalides.';
    }
    redirect(user.role === 'admin' ? '/admin' : '/', RedirectType.push);
}
