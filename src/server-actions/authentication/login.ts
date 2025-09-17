'use server';

import type { User } from '@server/database/schemas/users';
import { auth } from '@server/lib/auth';
import { getStringValue } from '@server/lib/get-string-value';
import { redirect, RedirectType } from 'next/navigation';

// Errors to do:
// - 'Compte bloqué. Veuillez réinitialiser le mot de passe.';
// - 'Veuillez utiliser la connection par classe pour accéder à votre compte.';

export async function login(_previousState: string, formData: FormData): Promise<string> {
    const email = getStringValue(formData.get('email'));
    const password = getStringValue(formData.get('password'));
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
        console.error(error);
        return 'Identifiants invalides.';
    }
    redirect(user.role === 'admin' ? '/admin' : '/', RedirectType.push);
}
