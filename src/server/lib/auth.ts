import { db } from '@server/database';
import { registerService } from '@server/lib/register-service';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';

import { ssoPlugin } from './parlemonde-sso-plugin';

export const auth = registerService('auth', () =>
    betterAuth({
        database: drizzleAdapter(db, {
            provider: 'pg',
        }),
        plugins: ssoPlugin ? [ssoPlugin, nextCookies()] : [nextCookies()], // make sure `nextCookies()` is the last plugin in the array
        emailAndPassword: {
            enabled: true,
        },
        advanced: {
            database: {
                generateId: false, // Done by database directly
            },
        },
        user: {
            modelName: 'users',
            additionalFields: {
                role: {
                    type: 'string', // enum: ['admin', 'mediator', 'teacher', 'parent']
                    required: true,
                    defaultValue: 'teacher',
                    input: false, // don't allow user to set role
                },
            },
            changeEmail: {
                enabled: true,
                updateEmailWithoutVerification: true,
            },
        },
        session: {
            modelName: 'auth_sessions',
            cookieCache: {
                enabled: true,
                maxAge: 5 * 60, // Cache duration in seconds
            },
        },
        account: {
            modelName: 'auth_accounts',
        },
        verification: {
            modelName: 'auth_verifications',
        },
    }),
);
