/* eslint-disable camelcase */
import { eq } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { db } from './database';
import { auth } from '../lib/auth';
import { auth_sessions } from './schemas/auth-schemas';
import { users } from './schemas/users';

const DATABASE_URL = process.env.DATABASE_URL || '';

async function createDatabase(): Promise<void> {
    if (!DATABASE_URL.includes('localhost')) {
        // Skip database creation on non-local environments.
        return;
    }
    try {
        const client = postgres(DATABASE_URL.replace(/\/[^/]*$/, ''), { debug: true });
        const res = await client`SELECT datname FROM pg_catalog.pg_database WHERE datname = 'un_village'`;
        if (res.length === 0) {
            await client`CREATE DATABASE un_village`;
        }
        await client.end();
    } catch (e) {
        console.error(e);
    }
}

async function createAdminUser(): Promise<void> {
    const adminName = process.env.ADMIN_NAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminName || !adminPassword || !adminEmail) {
        return;
    }

    try {
        const results = await db.select().from(users).where(eq(users.name, adminName)).limit(1);
        if (results.length > 0) {
            return;
        }
        const result = await auth.api.signUpEmail({
            body: {
                email: adminEmail,
                password: adminPassword,
                name: adminName,
            },
        });
        await db
            .update(users)
            .set({
                role: 'admin',
            })
            .where(eq(users.id, result.user.id));
        if (result.token !== null) {
            await db.delete(auth_sessions).where(eq(auth_sessions.token, result.token));
        }
    } catch (error) {
        console.error(error);
        return;
    }
}

const start = async () => {
    await createDatabase();
    await migrate(db, { migrationsFolder: './drizzle' });
    await createAdminUser();
};

start()
    .catch(console.error)
    .finally(() => process.exit());
