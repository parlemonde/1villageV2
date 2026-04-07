'use server';

import { auth } from '@server/lib/auth';
import { getStringValue } from '@server/lib/get-string-value';

import { checkSSO } from './check-sso';

export async function resetPassword(_previousState: string, formData: FormData): Promise<string> {
    const email = getStringValue(formData.get('email'));
    const password = getStringValue(formData.get('password'));
    const token = getStringValue(formData.get('token'));
    const result = await checkSSO(email);

    if (result !== 'OK') {
        return result;
    }

    try {
        if (!token) {
            return 'Reset password token is missing';
        }

        const data = await auth.api.resetPassword({
            body: {
                newPassword: password,
                token,
            },
        });
        return `BetterAuth API resetPassword status: ${data.status})`;
    } catch {
        return 'Token invalide.';
    }
}
