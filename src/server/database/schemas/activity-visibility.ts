import { boolean, integer, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import { activities } from './activities';
import { classrooms } from './classrooms';
import { users } from './users';

export const activityVisibility = pgTable(
    'activity_visibility',
    {
        teacherId: uuid('teacherId')
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade',
            }),
        activityId: integer('activityId')
            .notNull()
            .references(() => activities.id),
        classroomId: integer('classroomId')
            .notNull()
            .references(() => classrooms.id),
        isHidden: boolean('isHidden').notNull().default(false),
    },
    (table) => [primaryKey({ columns: [table.teacherId, table.activityId, table.classroomId] })],
);
