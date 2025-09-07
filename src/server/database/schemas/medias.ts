import { pgTable, uuid, timestamp, integer, char, varchar, jsonb, boolean } from 'drizzle-orm/pg-core';

import { users } from './users';

const MEDIA_TYPES_ENUM = ['image', 'video', 'audio', 'h5p'] as const;
export type MediaType = (typeof MEDIA_TYPES_ENUM)[number];

interface ImageMetadata {
    width: number;
    height: number;
}
interface VideoMetadata {
    duration: number;
}
interface AudioMetadata {
    duration: number;
}

export const medias = pgTable('medias', {
    id: uuid().primaryKey().defaultRandom(),
    createDate: timestamp('createDate', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
    isPelico: boolean('isPelico').notNull().default(false),
    userId: integer('userId')
        .references(() => users.id, {
            onDelete: 'cascade',
        })
        .notNull(),
    type: char('type', { length: 5, enum: MEDIA_TYPES_ENUM }).notNull(),
    url: varchar('url', { length: 300 }).notNull(),
    metadata: jsonb('metadata').$type<ImageMetadata | VideoMetadata | AudioMetadata>(),
});

export type Media = typeof medias.$inferSelect;
