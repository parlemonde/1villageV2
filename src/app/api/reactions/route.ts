import { db } from '@server/database';
import { activityReactions } from '@server/database/schemas/activity-reactions';
import { classrooms, type Classroom } from '@server/database/schemas/classrooms';
import { eq, count, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsInteger } from 'nuqs/server';

const reactionsSearchParams = {
    activityId: parseAsInteger,
};

const loadSearchParams = createLoader(reactionsSearchParams);

export const GET = async ({ nextUrl }: NextRequest): Promise<NextResponse> => {
    const { activityId } = loadSearchParams(nextUrl.searchParams);
    if (!activityId) {
        return new NextResponse(null, { status: 400 });
    }

    const nbClassroomsPerReactions = await db
        .select({
            reactionValue: activityReactions.reaction,
            reactionCount: count(),
            classrooms: sql<Classroom[]>`array_agg(row_to_json(${classrooms}))`,
        })
        .from(activityReactions)
        .leftJoin(classrooms, eq(activityReactions.classroomId, classrooms.id))
        .where(eq(activityReactions.activityId, activityId))
        .groupBy(activityReactions.reaction);

    return NextResponse.json(nbClassroomsPerReactions);
};
