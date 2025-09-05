import { sql } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { boolean, smallint, integer, pgTable, varchar, serial, timestamp, jsonb } from 'drizzle-orm/pg-core';

import type { Activities } from './activity.types';
import { classrooms } from './classrooms';
import { users } from './users';
import { villages } from './villages';

export type ActivityType = Activities['type'];
// Use a map to catch missing values and ensure uniqueness
const ACTIVITY_TYPES_MAP: Record<ActivityType, boolean> = {
    libre: true,
    jeu: true,
    enigme: true,
};
export const ACTIVITY_TYPES_ENUM = Object.keys(ACTIVITY_TYPES_MAP) as ActivityType[];

export const activities = pgTable('activities', {
    id: serial('id').primaryKey(),
    type: varchar('type', { length: 20, enum: ACTIVITY_TYPES_ENUM as unknown as readonly [string, ...string[]] }).notNull(), // Use a varchar instead of pgEnum to be able to add new values without migrations
    phase: smallint('phase').notNull(),
    isPelico: boolean('isPelico').notNull().default(false),
    isPinned: boolean('isPinned').notNull().default(false),
    classroomId: integer('classroomId').references(() => classrooms.id, {
        onDelete: 'cascade',
    }), // Activity owned by a classroom
    userId: integer('userId')
        .references(() => users.id, {
            onDelete: 'cascade',
        })
        .notNull(), // User who created the activity
    villageId: integer('villageId').references(() => villages.id, {
        onDelete: 'cascade',
    }), // If null => global activity from admin
    createDate: timestamp('createDate', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
    publishDate: timestamp('publishDate', { mode: 'string', withTimezone: true }),
    updateDate: timestamp('updateDate', { mode: 'string', withTimezone: true })
        .notNull()
        .defaultNow()
        .$onUpdate(() => sql`now()`),
    deleteDate: timestamp('deleteDate', { mode: 'string', withTimezone: true }),
    data: jsonb('data'),
    draftUrl: varchar('draftUrl', { length: 300 }),
    parentActivityId: integer('parentActivityId').references((): AnyPgColumn => activities.id, {
        onDelete: 'cascade',
    }),
    responseActivityId: integer('responseActivityId').references((): AnyPgColumn => activities.id, {
        onDelete: 'cascade',
    }),
});

type InferredActivity = typeof activities.$inferSelect;
export type Activity = InferredActivity & Activities;
