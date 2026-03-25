'use server';

import { auth } from '@server/lib/auth';
import { headers } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

export async function logout(redirectTo?: string) {
    await auth.api.signOut({ headers: await headers() });
    redirect(`${redirectTo || '/'}`, RedirectType.push);
}
