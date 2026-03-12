import { integer, pgTable, serial, text, timestamp, unique } from 'drizzle-orm/pg-core';

import { activities } from './activities';
import { classrooms } from './classrooms';

export const activityReactions = pgTable(
    'activity_reactions',
    {
        id: serial('id').primaryKey(),
        activityId: integer('activityId')
            .references(() => activities.id, { onDelete: 'cascade' })
            .notNull(),
        classroomId: integer('classroomId')
            .references(() => classrooms.id, { onDelete: 'cascade' })
            .notNull(),
        reaction: text('reaction').notNull(), // 'thumbs_up' | 'heart' | 'wow' | ...
        createdAt: timestamp('createdAt', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [unique().on(t.activityId, t.classroomId)],
);

export type ActivityReaction = typeof activityReactions.$inferSelect;
