import { pgTable, serial, varchar, integer, jsonb } from 'drizzle-orm/pg-core';

import { users } from './users';
import { villages } from './villages';

export const classrooms = pgTable('classrooms', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 150 }).notNull(),
    address: varchar('address', { length: 300 }).notNull(),
    coordinates: jsonb('coordinates').$type<{ latitude: number; longitude: number }>(),
    avatarUrl: varchar('avatarUrl', { length: 300 }),
    teacherId: integer('teacherId')
        .references(() => users.id, {
            onDelete: 'cascade',
        })
        .notNull(),
    villageId: integer('villageId')
        .references(() => villages.id, {
            onDelete: 'cascade',
        })
        .notNull(),
    countryCode: varchar('countryCode', { length: 2 }).notNull(),
});
export type Classroom = typeof classrooms.$inferSelect;
