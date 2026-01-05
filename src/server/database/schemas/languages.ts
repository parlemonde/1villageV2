import { pgTable, text, boolean, char, timestamp } from 'drizzle-orm/pg-core';

export const languages = pgTable('languages', {
    code: char('code', {
        length: 2,
    }).primaryKey(), // ISO 639-1 code (e.g., 'fr', 'en', 'de')
    label: text('label').notNull(), // Display name of the language
    isDefault: boolean('isDefault').notNull().default(false), // Whether this is the default language
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Language = typeof languages.$inferSelect;
