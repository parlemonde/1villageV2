import { trace } from '@opentelemetry/api';
import type { User } from '@server/database/schemas/users';
import { auth } from '@server/lib/auth';
import { headers } from 'next/headers';
import { cache } from 'react';

const tracer = trace.getTracer('auth');

export const getCurrentUser = cache(async (): Promise<User | undefined> => {
    return tracer.startActiveSpan('getCurrentUser', async (span) => {
        try {
            const session = await auth.api.getSession({
                headers: await headers(),
            });
            const user = session?.user as User | undefined;
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
