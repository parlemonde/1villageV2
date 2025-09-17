import type { User } from '@server/database/schemas/users';
import { auth } from '@server/lib/auth';
import { headers } from 'next/headers';
import { cache } from 'react';

export const getCurrentUser = cache(async (): Promise<User | undefined> => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    return session?.user as User | undefined;
});
