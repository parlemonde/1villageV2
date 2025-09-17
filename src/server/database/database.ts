/* eslint-disable camelcase */
import { registerService } from '@server/lib/register-service';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { activities } from './schemas/activities';
import { auth_sessions, auth_accounts, auth_verifications } from './schemas/auth-schemas';
import { classrooms } from './schemas/classrooms';
import { medias } from './schemas/medias';
import { sessions } from './schemas/sessions';
import { students } from './schemas/students';
import { users } from './schemas/users';
import { villages } from './schemas/villages';

const ssl = process.env.DATABASE_URL?.includes('localhost') ? false : 'verify-full';
const queryClient = postgres(process.env.DATABASE_URL || '', { max: 10, ssl });

export const db = registerService('db', () =>
    drizzle(queryClient, {
        logger: process.env.NODE_ENV !== 'production',
        schema: { users, classrooms, villages, activities, students, medias, sessions, auth_sessions, auth_accounts, auth_verifications },
    }),
);
