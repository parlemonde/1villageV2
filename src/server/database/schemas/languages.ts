import { pgTable, text, boolean, char, timestamp, jsonb } from 'drizzle-orm/pg-core';
import type { AbstractIntlMessages } from 'next-intl';

export const languages = pgTable('languages', {
    code: char('code', {
        length: 2,
    }).primaryKey(), // ISO 639-1 code (e.g., 'fr', 'en', 'de')
    label: text('label').notNull(), // Display name of the language
    labelInLanguage: text('label_in_language').notNull(), // Display name in the language
    isDefault: boolean('isDefault').notNull().default(false), // Whether this is the default language
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    locales: jsonb('locales').$type<AbstractIntlMessages>(),
});

export type Language = typeof languages.$inferSelect;
