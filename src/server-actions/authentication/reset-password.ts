'use server';

import { auth } from '@server/lib/auth';
import { getStringValue } from '@server/lib/get-string-value';
import { getExtracted } from 'next-intl/server';

export async function resetPassword(_previousState: string, formData: FormData): Promise<string> {
    const t = await getExtracted('common');
    const password = getStringValue(formData.get('password'));
    const token = getStringValue(formData.get('token'));

    try {
        if (!token) {
            return t('Reset password token manquant');
        }

        const data = await auth.api.resetPassword({
            body: {
                newPassword: password,
                token,
            },
        });
        return !data.status ? t('Erreur lors de la mise à jour de votre mot de passe') : '';
    } catch (error: unknown) {
        const apiError = error as { body?: { message?: string; code?: string } };
        let errorMessage = t('Erreur coté serveur: {error}', { error: apiError?.body?.message || 'N/A' });
        switch (apiError?.body?.code) {
            case 'PASSWORD_TOO_SHORT':
                errorMessage = t('Mot de passe trop court');
                break;
            default:
                break;
        }
        return errorMessage;
    }
}
