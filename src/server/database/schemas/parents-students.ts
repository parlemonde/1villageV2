import { integer, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import { students } from './students';
import { users } from './users';

export const parentsStudents = pgTable(
    'parents_students',
    {
        parentId: uuid('parentId')
            .references(() => users.id, {
                onDelete: 'cascade',
            })
            .notNull(),
        studentId: integer('studentId')
            .references(() => students.id, {
                onDelete: 'cascade',
            })
            .notNull(),
    },
    (table) => [primaryKey({ columns: [table.parentId, table.studentId] })],
);
