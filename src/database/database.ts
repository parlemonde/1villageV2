import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { users } from './schemas/users';
import { registerService } from '@/lib/register-service';

const ssl = process.env.DATABASE_URL?.includes('localhost') ? false : 'verify-full';
const queryClient = postgres(process.env.DATABASE_URL || '', { max: 10, ssl });

export const db = registerService('db', () =>
    drizzle(queryClient, {
        logger: process.env.NODE_ENV !== 'production',
        schema: { users },
    }),
);
