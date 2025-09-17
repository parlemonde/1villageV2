import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';

const USER_ROLES_ENUM = ['admin', 'mediator', 'teacher', 'parent'] as const;
export type UserRole = (typeof USER_ROLES_ENUM)[number];

export const users = pgTable('users', {
    id: uuid().primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .$onUpdate(() => sql`now()`)
        .notNull(),
    role: text('role', { enum: USER_ROLES_ENUM }).default('teacher').notNull(),
});

type FullUser = typeof users.$inferSelect;
export type User = Pick<FullUser, 'id' | 'name' | 'email' | 'role'> & {
    image?: string | null; // set to optional because of better-auth
};
