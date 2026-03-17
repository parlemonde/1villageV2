import { trace } from '@opentelemetry/api';
import { db } from '@server/database';
import { users, type User } from '@server/database/schemas/users';
import { auth } from '@server/lib/auth';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { cache } from 'react';

const tracer = trace.getTracer('auth');

export const getCurrentUser = cache(async (): Promise<User | undefined> => {
    return tracer.startActiveSpan('getCurrentUser', async (span) => {
        try {
            const session = await auth.api.getSession({
                headers: await headers(),
            });
            const sessionUser = session?.user as User | undefined;
            if (!sessionUser) {
                return undefined;
            }

            span.setAttributes({
                'user.id': sessionUser.id,
                'user.email': sessionUser.email,
                'user.name': sessionUser.name,
            });

            // Cookie cache doesn't include additionalFields like firstLogin,
            // so we fetch it directly from the database.
            const dbUser = await db
                .select({ firstLogin: users.firstLogin })
                .from(users)
                .where(eq(users.id, sessionUser.id))
                .then((rows) => rows[0]);

            return {
                ...sessionUser,
                firstLogin: dbUser?.firstLogin ?? 0,
            };
        } finally {
            span.end();
        }
    });
});
