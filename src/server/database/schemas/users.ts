import { pgTable, serial, varchar, char, smallint, integer } from 'drizzle-orm/pg-core';

const ROLES_ENUM = ['admin', 'mediator', 'teacher', 'parent'] as const;
export type UserRole = (typeof ROLES_ENUM)[number];

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    plmId: integer('plmId').unique(),
    email: varchar('email', { length: 150 }).notNull().unique(),
    name: varchar('name', { length: 150 }).notNull(),
    avatarUrl: varchar('avatarUrl', { length: 300 }),
    passwordHash: char('passwordHash', { length: 100 }),
    verificationHash: char('verificationHash', { length: 100 }),
    accountRegistration: smallint('accountRegistration').notNull().default(0),
    role: varchar('role', { length: 20, enum: ROLES_ENUM }).notNull().default('teacher'),
});
type FullUser = typeof users.$inferSelect;
export type User = Pick<FullUser, 'id' | 'name' | 'email' | 'role' | 'avatarUrl'> & {
    useSSO?: boolean;
};
