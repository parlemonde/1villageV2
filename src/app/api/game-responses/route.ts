import { db } from '@server/database';
import type { Classroom } from '@server/database/schemas/classrooms';
import { classrooms } from '@server/database/schemas/classrooms';
import type { GameResponse } from '@server/database/schemas/game-responses';
import { gameResponses } from '@server/database/schemas/game-responses';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsInteger } from 'nuqs/server';

const gameResponsesSearchParams = {
    gameId: parseAsInteger,
    questionId: parseAsInteger,
    villageId: parseAsInteger,
};

const loadSearchParams = createLoader(gameResponsesSearchParams);

export interface GameResponsesClassrooms {
    classrooms: Classroom;
    game_responses: GameResponse;
}

export const GET = async ({ nextUrl }: NextRequest): Promise<NextResponse<GameResponsesClassrooms[]>> => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const { gameId, questionId } = loadSearchParams(nextUrl.searchParams);
    if (!gameId || !questionId) {
        return new NextResponse(null, { status: 400 });
    }

    const result = await db
        .select()
        .from(gameResponses)
        .innerJoin(classrooms, eq(classrooms.id, gameResponses.classroomId))
        .where(and(eq(gameResponses.gameId, gameId), eq(gameResponses.questionId, questionId)));

    return NextResponse.json(result);
};
