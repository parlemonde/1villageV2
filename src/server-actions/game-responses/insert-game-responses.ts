'use server';

import { db } from '@server/database';
import { gameResponses } from '@server/database/schemas/game-responses';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq, ne } from 'drizzle-orm';

interface CreateGameResponse {
    gameId: number;
    questionId: number;
    classroomId: number;
    response: string;
    sessionId?: number;
}

export const insertGameResponse = async ({
    gameId,
    questionId,
    classroomId,
    response,
    sessionId,
}: CreateGameResponse): Promise<number | undefined> => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('Unauthorized');
        }

        const conditions = [eq(gameResponses.gameId, gameId), eq(gameResponses.questionId, questionId), eq(gameResponses.classroomId, classroomId)];

        if (sessionId) {
            conditions.push(ne(gameResponses.sessionId, sessionId));
        }
        await db.delete(gameResponses).where(and(...conditions));

        const [row] = await db
            .insert(gameResponses)
            .values({
                gameId,
                questionId,
                classroomId,
                response,
                sessionId,
            })
            .returning();

        return row.sessionId;
    } catch (e) {
        console.error(e);
    }
};
