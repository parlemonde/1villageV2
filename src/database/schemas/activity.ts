import { sql } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { boolean, smallint, integer, pgTable, varchar, serial, timestamp, jsonb } from 'drizzle-orm/pg-core';

import { classrooms } from './classroom';
import { users } from './users';
import { villages } from './village';

const ACTIVITY_TYPES_ENUM = ['libre', 'jeu', 'enigme'] as const;
export type ActivityType = (typeof ACTIVITY_TYPES_ENUM)[number];

export const activities = pgTable('activities', {
    id: serial('id').primaryKey(),
    type: varchar('type', { length: 20, enum: ACTIVITY_TYPES_ENUM }).notNull(), // Use a varchar instead of pgEnum to be able to add new values without migrations
    phase: smallint('phase').notNull(),
    isPelico: boolean('isPelico').notNull().default(false),
    isPinned: boolean('isPinned').notNull().default(false),
    classroomId: integer('classroomId').references(() => classrooms.id, {
        onDelete: 'cascade',
    }), // Activity owned by a classroom
    userId: integer('userId').references(() => users.id, {
        onDelete: 'cascade',
    }), // Activity owned by a user (for example a mediator)
    villageId: integer('villageId').references(() => villages.id, {
        onDelete: 'cascade',
    }), // If null => global activity from admin (pelico)
    countryCode: varchar('countryCode', { length: 2 }).notNull(),
    createDate: timestamp('createDate', { mode: 'string' }).notNull().defaultNow(),
    publishDate: timestamp('publishDate', { mode: 'string' }),
    updateDate: timestamp('updateDate', { mode: 'string' })
        .notNull()
        .defaultNow()
        .$onUpdate(() => sql`now()`),
    deleteDate: timestamp('deleteDate', { mode: 'string' }),
    content: jsonb('content'),
    draftUrl: varchar('draftUrl', { length: 300 }),
    parentActivityId: integer('parentActivityId').references((): AnyPgColumn => activities.id, {
        onDelete: 'cascade',
    }),
    // responseActivityId
    // isVisibleToParent
    // isDisplayed
});
export type Activity = typeof activities.$inferSelect;
