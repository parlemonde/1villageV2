import { pgTable, serial, varchar, integer, jsonb } from 'drizzle-orm/pg-core';

import { users } from './users';
import { villages } from './villages';

export const classrooms = pgTable('classrooms', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 150 }).notNull(),
    address: varchar('address', { length: 300 }).notNull(),
    level: varchar('level', { length: 150 }), // Used to display the classroom name
    city: varchar('city', { length: 150 }).notNull(), // Used to display the classroom name
    coordinates: jsonb('coordinates').$type<{ latitude: number; longitude: number }>(),
    avatarUrl: varchar('avatarUrl', { length: 300 }),
    mascotteId: integer('mascotteId'),
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
