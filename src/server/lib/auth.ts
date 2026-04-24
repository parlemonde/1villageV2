import { db } from '@server/database';
import { sendAccountConfirmationEmail } from '@server/emails/send-account-confirmation-email';
import { registerService } from '@server/lib/register-service';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins';
import { adminAc, userAc } from 'better-auth/plugins/admin/access';

import { getEnvVariable } from './get-env-variable';
import { ssoPlugin } from './parlemonde-sso-plugin';

const adminPlugin = admin({
    defaultRole: 'teacher',
    roles: {
        admin: adminAc,
        mediator: userAc,
        teacher: userAc,
        parent: userAc,
    },
});
const cookiesPlugin = nextCookies();

export const auth = registerService('auth', () =>
    betterAuth({
        baseURL: getEnvVariable('HOST_URL'),
        database: drizzleAdapter(db, {
            provider: 'pg',
        }),
        plugins: ssoPlugin ? [ssoPlugin, adminPlugin, cookiesPlugin] : [adminPlugin, cookiesPlugin], // make sure `nextCookies()` is the last plugin in the array
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: true,
        },
        advanced: {
            database: {
                generateId: false, // Done by database directly
            },
        },
        user: {
            modelName: 'users',
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
        emailVerification: {
            autoSignInAfterVerification: true,
            sendVerificationEmail: async ({ user, url }) => {
                void sendAccountConfirmationEmail(user.email, url);
            },
        },
    }),
);
