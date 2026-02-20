import { sql } from 'drizzle-orm';
import { index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const gameResponses = pgTable(
    'game_responses',
    {
        id: serial('id').primaryKey(),
        gameId: integer('gameId').notNull(),
        questionId: integer('questionId').notNull(),
        classroomId: integer('classroomId').notNull(),
        sessionId: serial('sessionId'),
        response: text('response'),
        createDate: timestamp('createDate', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
        updateDate: timestamp('updateDate', { mode: 'string', withTimezone: true })
            .$onUpdate(() => sql`now()`)
            .notNull(),
    },
    (table) => [index().on(table.gameId, table.questionId, table.classroomId)],
);

export type GameResponse = typeof gameResponses.$inferSelect;
