'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function updateLocale(locale: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set('locale', locale, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
    });
    // Revalidate all pages to apply the new locale
    revalidatePath('/', 'layout');
}
