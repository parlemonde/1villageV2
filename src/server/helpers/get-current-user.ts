import { trace } from '@opentelemetry/api';
import { db } from '@server/database';
import type { User } from '@server/database/schemas/users';
import { users } from '@server/database/schemas/users';
import { auth } from '@server/lib/auth';
import { eq } from 'drizzle-orm';
import { cacheTag, updateTag } from 'next/cache';
import { headers } from 'next/headers';
import { connection } from 'next/server';
import { cache } from 'react';

const tracer = trace.getTracer('auth');

const getUserExtraDataImpl = async (userId: string) => {
    'use cache';
    cacheTag('userExtraData');
    return await db
        .select({
            firstLogin: users.firstLogin,
            adminPublicationSubscribed: users.adminPublicationSubscribed,
            commentActivitySubscribed: users.commentActivitySubscribed,
        })
        .from(users)
        .where(eq(users.id, userId));
};

export async function getUserExtraData(userId: string) {
    await connection();
    return getUserExtraDataImpl(userId);
}

export async function invalidateUserExtraData() {
    updateTag('userExtraData');
}

export const getCurrentUser = cache(async (): Promise<User | undefined> => {
    return tracer.startActiveSpan('getCurrentUser', async (span) => {
        try {
            const session = await auth.api.getSession({
                headers: await headers(),
            });
            let user = session?.user as User | undefined;

            if (user) {
                const extraData = await getUserExtraData(user.id);
                if (extraData && extraData.length > 0) {
                    user = { ...user, ...extraData[0] };
                }
            }

            if (user) {
                span.setAttributes({
                    'user.id': user.id,
                    'user.email': user.email,
                    'user.name': user.name,
                });
            }
            return user;
        } finally {
            span.end();
        }
    });
});
