import { pgTable, serial, varchar, integer, smallint } from 'drizzle-orm/pg-core';

import { json } from '../lib/custom-json';

export const villages = pgTable('villages', {
    id: serial('id').primaryKey(),
    plmId: integer('plmId').unique(),
    name: varchar('name', { length: 150 }).notNull(),
    countries: json<string, string[]>('countries').notNull(),
    activePhase: smallint('activePhase').notNull(),
    phaseStartDates: json<string, Record<number, string>>('phaseStartDates').notNull(),
});
export type Village = typeof villages.$inferSelect;
