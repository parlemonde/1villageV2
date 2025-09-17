import { pgTable, serial, integer, text, uuid } from 'drizzle-orm/pg-core';

import { classrooms } from './classrooms';
import { users } from './users';

export const students = pgTable('students', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    teacherId: uuid('teacherId')
        .references(() => users.id, {
            onDelete: 'cascade',
        })
        .notNull(),
    parentId: uuid('parentId').references(() => users.id, {
        onDelete: 'set null',
    }),
    classroomId: integer('classroomId')
        .references(() => classrooms.id, {
            onDelete: 'cascade',
        })
        .notNull(),
    inviteCode: text('inviteCode'),
});

export type Student = typeof students.$inferSelect;
