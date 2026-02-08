/* eslint-disable camelcase */
import { getEnvVariable } from '@server/lib/get-env-variable';
import { registerService } from '@server/lib/register-service';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

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

const isLocalBD = getEnvVariable('DATABASE_URL')?.includes('localhost');
const queryClient = new Pool({ connectionString: getEnvVariable('DATABASE_URL'), ssl: !isLocalBD, max: 10 });

export const db = registerService('db', () =>
    drizzle({
        client: queryClient,
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
