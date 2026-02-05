import { sql } from 'drizzle-orm';
import { integer, jsonb, pgTable, serial, timestamp, uuid } from 'drizzle-orm/pg-core';

import { activities } from './activities';
import { users } from './users';

export const comments = pgTable('comments', {
    id: serial('id').primaryKey(),
    userId: uuid('userId')
        .references(() => users.id, {
            onDelete: 'cascade',
        })
        .notNull(),
    activityId: integer('activityId').references(() => activities.id, { onDelete: 'cascade' }),
    content: jsonb('content'),
    createDate: timestamp('createDate', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
    updateDate: timestamp('updateDate', { mode: 'string', withTimezone: true })
        .$onUpdate(() => sql`now()`)
        .notNull(),
});

export type Comment = typeof comments.$inferSelect;
