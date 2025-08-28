import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';

import { classrooms } from './classrooms';
import { users } from './users';

export const students = pgTable('students', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 150 }).notNull(),
    teacherId: integer('teacherId')
        .references(() => users.id, {
            onDelete: 'cascade',
        })
        .notNull(),
    parentId: integer('parentId').references(() => users.id, {
        onDelete: 'set null',
    }),
    classroomId: integer('classroomId')
        .references(() => classrooms.id, {
            onDelete: 'cascade',
        })
        .notNull(),
    inviteCode: varchar('inviteCode', { length: 20 }),
});

export type Student = typeof students.$inferSelect;
