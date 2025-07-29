'use server';

import { verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

import { db } from '@/database';
import { users } from '@/database/schemas/users';
import { getAccessToken } from '@/server-functions/get-access-token';
import { getStringValue } from '@/server-functions/get-string-value';

export async function login(_previousState: string, formData: FormData): Promise<string> {
    const email = getStringValue(formData.get('email'));
    const password = getStringValue(formData.get('password'));

    const user = await db.query.users.findFirst({
        columns: { id: true, passwordHash: true, accountRegistration: true },
        where: eq(users.email, email),
    });

    if (!user) {
        return 'Identifiants invalides.';
    }
    if (user.accountRegistration === 4) {
        return 'Compte bloqué. Veuillez réinitialiser le mot de passe.';
    }
    if (user.accountRegistration === 10) {
        return 'Veuillez utiliser la connection par classe pour accéder à votre compte.';
    }

    let isPasswordCorrect: boolean = false;
    try {
        isPasswordCorrect = await verify((user.passwordHash || '').trim(), password);
    } catch {
        return 'Identifiants invalides.';
    }

    if (!isPasswordCorrect) {
        await db
            .update(users)
            .set({
                accountRegistration: Math.min(user.accountRegistration + 1, 4), // Max 4 attempts
            })
            .where(eq(users.id, user.id));
        return 'Identifiants invalides.';
    } else if (user.accountRegistration > 0) {
        await db
            .update(users)
            .set({
                accountRegistration: 0,
            })
            .where(eq(users.id, user.id));
    }

    const accessToken = await getAccessToken({ userId: user.id });
    const cookieStore = await cookies();
    cookieStore.set({
        name: 'access-token',
        value: accessToken,
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 604800000),
        sameSite: 'strict',
    });
    redirect(`/`, RedirectType.push);
}
