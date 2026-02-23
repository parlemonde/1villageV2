import { jsonb, pgTable, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const userPreferences = pgTable('user_preferences', {
    userId: uuid('user_id')
        .primaryKey()
        .references(() => users.id, { onDelete: 'cascade' }),
    parentInvitationMessage: jsonb('parent_invitation_message'),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
