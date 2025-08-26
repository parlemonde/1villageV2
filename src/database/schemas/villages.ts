import { pgTable, serial, varchar, integer, smallint, jsonb } from 'drizzle-orm/pg-core';

export const villages = pgTable('villages', {
    id: serial('id').primaryKey(),
    plmId: integer('plmId').unique(),
    name: varchar('name', { length: 150 }).notNull(),
    countries: jsonb('countries').$type<string[]>().notNull(),
    activePhase: smallint('activePhase').notNull(),
    phaseStartDates: jsonb('phaseStartDates').$type<Record<number, string>>().notNull(),
    classroomCount: jsonb('classroomCount').$type<Record<string, number>>().notNull(),
});
export type Village = typeof villages.$inferSelect;
