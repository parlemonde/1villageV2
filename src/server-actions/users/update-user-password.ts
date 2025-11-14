'use server';

import { db } from '@server/database';
import { auth_accounts } from '@server/database/schemas/auth-schemas';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { auth } from '@server/lib/auth';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export const updateUserPassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
) => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        throw new Error('Non autorisé');
    }

    if (!currentPassword || currentPassword.trim().length === 0) {
        throw new Error('Le mot de passe actuel est requis');
    }

    if (!newPassword || newPassword.trim().length === 0) {
        throw new Error('Le nouveau mot de passe est requis');
    }

    if (newPassword !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
    }

    if (newPassword.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }

    // Verify current password
    const account = await db.query.auth_accounts.findFirst({
        where: eq(auth_accounts.userId, currentUser.id),
    });

    if (!account) {
        throw new Error('Compte non trouvé');
    }

    // Update password through Better Auth
    try {
        await auth.api.changePassword(
            {
                body: {
                    currentPassword,
                    newPassword,
                },
                headers: await headers(),
            },
        );
    } catch (error) {
        throw new Error('Le mot de passe actuel est incorrect');
    }

    return { success: true };
};
