'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { RedirectType, redirect } from 'next/navigation';

export async function logout(redirectTo?: string) {
    const cookieStore = await cookies();
    cookieStore.delete('access-token');

    revalidatePath('/', 'layout');
    redirect(`${redirectTo || '/'}`, RedirectType.push);
}
