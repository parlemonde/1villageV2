'use server';
import { cookies } from 'next/headers';

export const deleteCookie = async (name: string) => {
    const cookieStore = await cookies();
    cookieStore.delete(name);
};
