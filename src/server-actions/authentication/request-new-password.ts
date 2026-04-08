'use server';

import { auth } from '@server/lib/auth';
import { getEnvVariable } from '@server/lib/get-env-variable';
import { getStringValue } from '@server/lib/get-string-value';
import { getExtracted } from 'next-intl/server';

import { checkSSO } from './check-sso';

export async function requestNewPassword(_previousState: string, formData: FormData): Promise<string> {
    const t = await getExtracted('common');
    const email = getStringValue(formData.get('email'));
    const result = await checkSSO(email);
    const APP_URL = getEnvVariable('HOST_URL');

    if (result !== 'OK') {
        return result;
    }

    try {
        const data = await auth.api.requestPasswordReset({
            body: {
                email: email,
                redirectTo: `${APP_URL}/login/famille/reset-password`,
            },
        });
        return !data.status ? `error: ${data.message}` : '';
    } catch {
        return t('Identifiants invalides');
    }
}
