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
    } catch {
        return t('Token invalide');
    }
}
