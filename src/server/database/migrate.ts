/* eslint-disable camelcase */
import { auth } from '@server/lib/auth';
import { getEnvVariable } from '@server/lib/get-env-variable';
import { eq } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

import { db } from './database';
import { auth_sessions } from './schemas/auth-schemas';
import { languages } from './schemas/languages';
import { users } from './schemas/users';

const DATABASE_URL = getEnvVariable('DATABASE_URL');

async function createDatabase(): Promise<void> {
    if (!DATABASE_URL.includes('localhost')) {
        // Skip database creation on non-local environments.
        return;
    }
    try {
        const client = new Client({ connectionString: DATABASE_URL.replace(/\/[^/]*$/, ''), ssl: false });
        await client.connect();
        const res = await client.query('SELECT datname FROM pg_catalog.pg_database WHERE datname = $1', ['un_village']);
        if (res.rows.length === 0) {
            await client.query('CREATE DATABASE un_village');
        }
        await client.end();
    } catch (e) {
        console.error(e);
    }
}

async function createAdminUser(): Promise<void> {
    const adminPassword = getEnvVariable('ADMIN_PASSWORD');
    const adminEmail = getEnvVariable('ADMIN_EMAIL');

    if (!adminPassword || !adminEmail) {
        return;
    }

    try {
        const results = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
        if (results.length > 0) {
            return;
        }
        const result = await auth.api.signUpEmail({
            body: {
                email: adminEmail,
                password: adminPassword,
                name: 'Admin',
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

async function insertDefaultLanguage(): Promise<void> {
    const result = await db.query.languages.findFirst({
        where: eq(languages.code, 'fr'),
    });
    if (result === undefined) {
        await db.insert(languages).values([
            {
                code: 'fr',
                label: 'Français',
                labelInLanguage: 'Français',
                isDefault: true,
            },
        ]);
    }
}

const start = async () => {
    await createDatabase();
    await migrate(db, { migrationsFolder: './drizzle' });
    await createAdminUser();
    await insertDefaultLanguage();
};

start()
    .catch(console.error)
    .finally(() => process.exit());
