'use server';

import { db } from '@server/database';
import { parentsStudents } from '@server/database/schemas/parents-students';
import { students } from '@server/database/schemas/students';
import { users } from '@server/database/schemas/users';
import { auth } from '@server/lib/auth';
import { getStringValue } from '@server/lib/get-string-value';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';
import { APIError } from 'better-auth';
import { count, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getExtracted } from 'next-intl/server';

const MAX_ACCOUNTS_PER_CODE = 5;

export async function register(_previousState: ServerActionResponse, formData: FormData): Promise<ServerActionResponse> {
    const t = await getExtracted('common');
    try {
        const email = getStringValue(formData.get('email'));
        const firstName = getStringValue(formData.get('firstName'));
        const lastName = getStringValue(formData.get('lastName'));
        const inviteCode = getStringValue(formData.get('inviteCode'));
        const password = getStringValue(formData.get('password'));
        const passwordConfirmation = getStringValue(formData.get('passwordConfirmation'));
        const acceptedTerms = getStringValue(formData.get('acceptTerms'));
        const acceptedNewsletter = getStringValue(formData.get('acceptNewsletter'));

        if (!email || !firstName || !lastName || !inviteCode || !password || !passwordConfirmation || !acceptedTerms) {
            return { error: { message: t('Veuillez remplir tous les champs') } };
        }

        if (password !== passwordConfirmation) {
            return { error: { message: t('Les mots de passe ne correspondent pas') } };
        }

        const [row] = await db.select({ studentId: students.id }).from(students).where(eq(students.inviteCode, inviteCode)).limit(1);

        if (row === undefined) {
            return { error: { message: t('Le code enfant est invalide') } };
        }

        const [result] = await db
            .select({ count: count() })
            .from(students)
            .innerJoin(parentsStudents, eq(students.id, parentsStudents.studentId))
            .where(eq(students.inviteCode, inviteCode));

        if (result.count >= MAX_ACCOUNTS_PER_CODE) {
            return { error: { message: t('Le code enfant a expiré') } };
        }

        const response = await auth.api.signUpEmail({
            body: {
                name: firstName + ' ' + lastName,
                email,
                password,
            },
        });
        await db.update(users).set({ role: 'parent' }).where(eq(users.id, response.user.id));

        await db.insert(parentsStudents).values({ parentId: response.user.id, studentId: row.studentId });
    } catch (error) {
        if (error instanceof APIError) {
            // TODO log
        }
        console.error(error);
        return { error: { message: t('Une erreur est survenue') } };
    }

    redirect('/');
}
