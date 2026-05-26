import { db } from '@server/database';
import type { EmailType } from '@server/emails/templates/utils/types';
import { registerService } from '@server/lib/register-service';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins';
import { adminAc, userAc } from 'better-auth/plugins/admin/access';
import { getExtracted } from 'next-intl/server';

import { logger } from './logger';
import { ssoPlugin } from './parlemonde-sso-plugin';
import { sendEmail } from './sendEmail';

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
        database: drizzleAdapter(db, {
            provider: 'pg',
        }),
        plugins: ssoPlugin ? [ssoPlugin, adminPlugin, cookiesPlugin] : [adminPlugin, cookiesPlugin], // make sure `nextCookies()` is the last plugin in the array
        emailAndPassword: {
            enabled: true,
            sendResetPassword: async ({ user, url, token }) => {
                logger.info(`sendResetPassword to user ${user.email}`);
                logger.info(`sendResetPassword containing url ${url}`, { token: token });
                const t = await getExtracted('common');
                void sendEmail({
                    to: user.email,
                    subject: t('Mot de passe oublié - 1Village'),
                    emailType: 'RESET_PASSWORD' as EmailType,
                    props: {
                        firstName: user.name ?? '',
                        resetPasswordLink: url,
                    },
                });
            },
            onPasswordReset: async ({ user }) => {
                logger.info(`Password for user ${user.email} has been reset.`);
            },
        },
        advanced: {
            database: {
                generateId: false, // Done by database directly
            },
        },
        user: {
            modelName: 'users',
            additionalFields: {
                firstLogin: {
                    type: 'number',
                    fieldName: 'first_login',
                    input: false,
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
