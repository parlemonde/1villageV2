/**
 * User fields are managed by better-auth.
 * Do not modify default fields: id, name, email, emailVerified, image, createdAt, updatedAt, and role.
 *
 * Additional fields can be added. In this case, add them to the `additionalFields` object in the `auth` service.
 * See: https://www.better-auth.com/docs/reference/options#user
 */
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
        .$onUpdate(() => new Date())
        .notNull(),
    role: text('role', { enum: USER_ROLES_ENUM }).default('teacher').notNull(),
    banned: boolean('banned').default(false),
    bannedReason: text('banned_reason'),
    banExpires: timestamp('ban_expires', { withTimezone: true }),
});

type FullUser = typeof users.$inferSelect;
export type User = Pick<FullUser, 'id' | 'name' | 'email' | 'role'> & {
    image?: string | null; // set to optional because of better-auth
};
