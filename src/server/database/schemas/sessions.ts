import { pgTable, uuid, timestamp, integer } from 'drizzle-orm/pg-core';

import { users } from './users';

export const sessions = pgTable('sessions', {
    id: uuid().primaryKey().defaultRandom(),
    date: timestamp('date', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
    userId: integer('userId')
        .references(() => users.id, {
            onDelete: 'cascade',
        })
        .notNull(),
    durationSeconds: integer('durationSeconds').notNull().default(0),
});

export type Session = typeof sessions.$inferSelect;
