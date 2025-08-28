import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { db } from './database';
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
        const user = {
            name: adminName,
            email: adminEmail,
            passwordHash: await hash(adminPassword),
            role: 'admin' as const,
        };
        await db.insert(users).values(user);
    } catch {
        return;
    }
}

const start = async () => {
    await createDatabase();
    const ssl = DATABASE_URL.includes('localhost') ? false : 'verify-full';
    const migrationClient = postgres(DATABASE_URL, { max: 1, ssl });
    const db = drizzle(migrationClient, { logger: process.env.NODE_ENV !== 'production' });
    await migrate(db, { migrationsFolder: './drizzle' });
    await createAdminUser();
    await migrationClient.end();
};

start()
    .catch(console.error)
    .finally(() => process.exit());
