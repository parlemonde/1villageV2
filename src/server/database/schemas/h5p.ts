import { sql } from 'drizzle-orm';
import { boolean, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const h5pKeyValue = pgTable('h5p_key_value', {
    key: text('key').primaryKey(),
    value: jsonb('value').notNull().$type<unknown>(),
});

export const h5pLibraries = pgTable(
    'h5p_libraries',
    {
        ubername: text('ubername').primaryKey(),
        machineName: text('machine_name').notNull(),
        metadata: jsonb('metadata').notNull(),
        additionalMetadata: jsonb('additional_metadata').notNull().default({}),
        createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true })
            .$onUpdate(() => sql`now()`)
            .notNull()
            .defaultNow(),
    },
    (t) => [index('idx_h5p_libraries_machine_name').on(t.machineName)],
);

export const h5pContents = pgTable('h5p_contents', {
    id: uuid('id').primaryKey(),
    metadata: jsonb('metadata').notNull(),
    parameters: jsonb('parameters').notNull(),
    creatorId: uuid('creator_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
    createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true })
        .$onUpdate(() => sql`now()`)
        .notNull()
        .defaultNow(),
});

export const h5pContentUserData = pgTable(
    'h5p_content_user_data',
    {
        contentId: uuid('content_id')
            .references(() => h5pContents.id, { onDelete: 'cascade' })
            .notNull(),
        userId: text('user_id').notNull(),
        dataType: text('data_type').notNull(),
        subContentId: text('sub_content_id').notNull().default(''),
        contextId: text('context_id').notNull().default(''),
        userState: text('user_state').notNull(),
        preload: boolean('preload').notNull().default(false),
        invalidate: boolean('invalidate').notNull().default(false),
    },
    (t) => [
        primaryKey({ columns: [t.contentId, t.userId, t.dataType, t.subContentId, t.contextId] }),
        index('idx_h5p_user_data_user_id').on(t.userId),
        index('idx_h5p_user_data_content_id').on(t.contentId),
    ],
);

export const h5pFinishedData = pgTable(
    'h5p_finished_data',
    {
        contentId: uuid('content_id')
            .references(() => h5pContents.id, { onDelete: 'cascade' })
            .notNull(),
        userId: text('user_id').notNull(),
        score: integer('score'),
        maxScore: integer('max_score'),
        openedTimestamp: integer('opened_timestamp'),
        finishedTimestamp: integer('finished_timestamp'),
        completionTime: integer('completion_time'),
    },
    (t) => [
        primaryKey({ columns: [t.contentId, t.userId] }),
        index('idx_h5p_finished_data_user_id').on(t.userId),
        index('idx_h5p_finished_data_content_id').on(t.contentId),
    ],
);

export type H5pKeyValue = typeof h5pKeyValue.$inferSelect;
export type H5pLibrary = typeof h5pLibraries.$inferSelect;
export type H5pContent = typeof h5pContents.$inferSelect;
export type H5pContentUserData = typeof h5pContentUserData.$inferSelect;
export type H5pFinishedData = typeof h5pFinishedData.$inferSelect;
