import { aggregateActivities } from '@app/api/statistics/phase/[id]/helpers';
import type { PhaseActivitiesResponse } from '@app/api/statistics/phase/[id]/types';
import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import { classrooms } from '@server/database/schemas/classrooms';
import { medias } from '@server/database/schemas/medias';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, count, eq, isNull } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsInteger } from 'nuqs/server';

const phaseActivitiesSearchParams = {
    page: parseAsInteger.withDefault(1),
    itemsPerPage: parseAsInteger.withDefault(10),
};

const loadSearchParams = createLoader(phaseActivitiesSearchParams);

export const GET = async (
    { nextUrl }: NextRequest,
    { params }: { params: Promise<{ id: number; villageId: number }> },
): Promise<NextResponse<PhaseActivitiesResponse>> => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }
    if (user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const { id, villageId } = await params;
    if (Number.isNaN(id)) {
        return new NextResponse('Invalid Phase Id', { status: 400 });
    }
    if (Number.isNaN(villageId)) {
        return new NextResponse('Invalid Village Id', { status: 400 });
    }

    const { page, itemsPerPage } = loadSearchParams(nextUrl);

    const sqlResult = await db
        .select({
            count: count(activities.id),
            type: activities.type,
            name: classrooms.countryCode,
            id: classrooms.countryCode,
        })
        .from(activities)
        .innerJoin(classrooms, eq(activities.classroomId, classrooms.id))
        .where(and(eq(activities.phase, id), eq(activities.villageId, Number(villageId))))
        .groupBy((a) => [a.name, a.type])
        .offset((page - 1) * itemsPerPage)
        .limit(itemsPerPage);

    const draftCount = await db
        .select({ count: count(activities.id), id: classrooms.countryCode })
        .from(activities)
        .innerJoin(classrooms, eq(activities.classroomId, classrooms.id))
        .where(and(eq(activities.phase, id), eq(activities.villageId, Number(villageId)), isNull(activities.publishDate)))
        .groupBy(classrooms.countryCode);

    const videoCount = await db
        .select({ count: count(medias.id), id: classrooms.countryCode })
        .from(medias)
        .innerJoin(activities, eq(medias.activityId, activities.id))
        .innerJoin(classrooms, eq(activities.classroomId, classrooms.id))
        .where(and(eq(activities.phase, id), eq(activities.villageId, Number(villageId)), eq(medias.type, 'video')))
        .groupBy(classrooms.countryCode);

    const result = aggregateActivities(sqlResult, draftCount, videoCount);

    return NextResponse.json({ ...result, totalElements: result.rows.length });
};
