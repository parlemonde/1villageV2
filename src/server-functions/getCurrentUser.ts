import { eq } from 'drizzle-orm';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { cache } from 'react';

import { db } from '@/database';
import type { User } from '@/database/schemas/users';
import { users } from '@/database/schemas/users';
import type { LoginData } from '@/server-functions/get-access-token';

const isLoginData = (data: unknown): data is LoginData => {
    return typeof data === 'object' && data !== null && 'userId' in data && typeof data.userId === 'number';
};

const APP_SECRET = new TextEncoder().encode(process.env.APP_SECRET || '');

const getUserById = cache(async (userId: number): Promise<User | undefined> => {
    const maybeUser = await db.query.users.findFirst({
        columns: { id: true, name: true, email: true, role: true, accountRegistration: true },
        where: eq(users.id, userId),
    });
    if (!maybeUser) {
        return undefined;
    }
    const { accountRegistration, ...user } = maybeUser;
    return {
        ...user,
        useSSO: accountRegistration === 10,
    };
});

export const getCurrentUser = async (): Promise<User | undefined> => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    if (!accessToken) {
        return undefined;
    }
    try {
        const { payload } = await jwtVerify<unknown>(accessToken, APP_SECRET);
        if (isLoginData(payload)) {
            return getUserById(payload.userId);
        }
    } catch {
        // do nothing
    }
    return undefined;
};
