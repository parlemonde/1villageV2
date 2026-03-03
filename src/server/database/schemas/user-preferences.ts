import { boolean, pgTable, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const userPreferences = pgTable('user_preferences', {
    userId: uuid('userId')
        .primaryKey()
        .references(() => users.id, {
            onDelete: 'cascade',
        }),
    wantsNewsletter: boolean('wantsNewsletter').notNull(),
});

export type UserPreferences = typeof userPreferences;
