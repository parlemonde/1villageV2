import { pgTable, uuid, timestamp, char, jsonb, boolean, text, integer } from 'drizzle-orm/pg-core';

import { activities } from './activities';
import { users } from './users';

const MEDIA_TYPES_ENUM = ['image', 'video', 'audio', 'h5p', 'pdf'] as const;
export type MediaType = (typeof MEDIA_TYPES_ENUM)[number];

export interface ImageMetadata {
    width: number;
    height: number;
}
export interface VideoMetadata {
    originalFilePath: string;
}
interface AudioMetadata {
    duration: number;
}
interface H5pMetadata {
    title: string;
    library: string;
}

export const medias = pgTable('medias', {
    id: uuid().primaryKey().defaultRandom(),
    createDate: timestamp('createDate', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
    isPelico: boolean('isPelico').notNull().default(false),
    userId: uuid('userId')
        .references(() => users.id, {
            onDelete: 'cascade',
        })
        .notNull(),
    type: char('type', { length: 5, enum: MEDIA_TYPES_ENUM }).notNull(),
    url: text('url').notNull(),
    metadata: jsonb('metadata').$type<ImageMetadata | VideoMetadata | AudioMetadata | H5pMetadata>(),
    activityId: integer('activityId').references(() => activities.id, { onDelete: 'cascade' }),
});

export type Media = typeof medias.$inferSelect;
