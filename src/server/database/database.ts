/* eslint-disable camelcase */
import { getEnvVariable } from '@server/lib/get-env-variable';
import { registerService } from '@server/lib/register-service';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { activities } from './schemas/activities';
import { phaseActivityTypes } from './schemas/activity-types';
import { auth_sessions, auth_accounts, auth_verifications } from './schemas/auth-schemas';
import { classrooms } from './schemas/classrooms';
import { comments } from './schemas/comments';
import { languages } from './schemas/languages';
import { medias } from './schemas/medias';
import { sessions } from './schemas/sessions';
import { students } from './schemas/students';
import { users } from './schemas/users';
import { villages } from './schemas/villages';

const ssl = getEnvVariable('DATABASE_URL')?.includes('localhost') ? false : 'verify-full';
const queryClient = postgres(getEnvVariable('DATABASE_URL'), { max: 10, ssl });

export const db = registerService('db', () =>
    drizzle(queryClient, {
        logger: process.env.NODE_ENV !== 'production',
        schema: {
            users,
            classrooms,
            comments,
            languages,
            villages,
            activities,
            students,
            medias,
            sessions,
            phaseActivityTypes,
            auth_sessions,
            auth_accounts,
            auth_verifications,
        },
    }),
);
