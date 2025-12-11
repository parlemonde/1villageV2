import { pgTable, serial, varchar, integer, jsonb, text, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';
import { villages } from './villages';

export const classrooms = pgTable('classrooms', {
    id: serial('id').primaryKey(),
    alias: text('alias'),
    name: text('name').notNull(),
    address: text('address').notNull(),
    level: text('level'), // Used to display the classroom name
    coordinates: jsonb('coordinates').$type<{ latitude: number; longitude: number }>(),
    avatarUrl: text('avatarUrl'),
    mascotteId: integer('mascotteId'),
    teacherId: uuid('teacherId')
        .references(() => users.id, {
            onDelete: 'cascade',
        })
        .notNull(),
    villageId: integer('villageId').references(() => villages.id, {
        onDelete: 'cascade',
    }),
    countryCode: varchar('countryCode', { length: 2 }).notNull(),
});
export type Classroom = typeof classrooms.$inferSelect;
