import type { HtmlEditorContent } from '@frontend/components/html/HtmlEditor/HtmlEditor';
import { integer, jsonb, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import { classrooms } from './classrooms';
import { users } from './users';

export const classroomPreferences = pgTable(
    'classroom_preferences',
    {
        userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
        classroomId: integer('classroom_id').references(() => classrooms.id, { onDelete: 'cascade' }),
        parentInvitationMessage: jsonb('parent_invitation_message').$type<HtmlEditorContent>(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.classroomId] })],
);

export type ClassroomPreferences = typeof classroomPreferences.$inferSelect;
