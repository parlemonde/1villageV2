import { pgTable, serial, integer, text, uuid, index } from 'drizzle-orm/pg-core';

import { classrooms } from './classrooms';
import { users } from './users';

export const students = pgTable(
    'students',
    {
        id: serial('id').primaryKey(),
        name: text('name').notNull(),
        teacherId: uuid('teacherId')
            .references(() => users.id, {
                onDelete: 'cascade',
            })
            .notNull(),
        classroomId: integer('classroomId')
            .references(() => classrooms.id, {
                onDelete: 'cascade',
            })
            .notNull(),
        inviteCode: text('inviteCode').unique(),
    },
    (table) => [index('inviteCode_idx').on(table.inviteCode)],
);

export type Student = typeof students.$inferSelect;
