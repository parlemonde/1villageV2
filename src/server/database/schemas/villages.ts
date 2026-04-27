import { pgTable, serial, integer, smallint, jsonb, text, boolean } from 'drizzle-orm/pg-core';

export const villages = pgTable('villages', {
    id: serial('id').primaryKey(),
    plmId: integer('plmId').unique(),
    name: text('name').notNull(),
    countries: jsonb('countries').$type<string[]>().notNull(),
    activePhase: smallint('activePhase').notNull(),
    phaseStartDates: jsonb('phaseStartDates').$type<Record<number, string>>().notNull(),
    classroomCount: jsonb('classroomCount').$type<Record<string, number>>().notNull(),
    isCrossVisible: boolean('isCrossVisible').notNull().default(false),
});
export type Village = typeof villages.$inferSelect;
