import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import { medias } from '@server/database/schemas/medias';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, asc, count, countDistinct, eq, inArray, isNotNull, isNull } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsInteger } from 'nuqs/server';

import { aggregateActivities } from './helpers';
import type { PhaseActivitiesResponse } from './types';

const phaseActivitiesSearchParams = {
    page: parseAsInteger.withDefault(1),
    itemsPerPage: parseAsInteger.withDefault(10),
};

const loadSearchParams = createLoader(phaseActivitiesSearchParams);

export const GET = async (
    { nextUrl }: NextRequest,
    { params }: { params: Promise<{ id: number }> },
): Promise<NextResponse<PhaseActivitiesResponse>> => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }
    if (user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const { id } = await params;

    const { page, itemsPerPage } = loadSearchParams(nextUrl.searchParams);

    const paginatedVillages = await db
        .select({ id: villages.id })
        .from(villages)
        .orderBy(asc(villages.name))
        .limit(itemsPerPage)
        .offset((page - 1) * itemsPerPage);

    const villagesIds = paginatedVillages.map((village) => village.id);

    const activityResult = await db
        .select({ count: count(activities.id), type: activities.type, name: villages.name, id: villages.id })
        .from(villages)
        .leftJoin(activities, and(eq(activities.villageId, villages.id), eq(activities.phase, id), isNotNull(activities.classroomId)))
        .where(and(inArray(villages.id, villagesIds), isNotNull(activities.publishDate), isNull(activities.deleteDate)))
        .groupBy(activities.type, villages.id, villages.name);

    const draftsCountResult = await db
        .select({ count: count(), id: villages.id })
        .from(villages)
        .innerJoin(activities, and(eq(activities.villageId, villages.id), eq(activities.phase, id), isNotNull(activities.classroomId)))
        .where(and(inArray(villages.id, villagesIds), isNull(activities.publishDate)))
        .groupBy(villages.id);

    const videosCountResult = await db
        .select({ count: count(), id: villages.id })
        .from(villages)
        .innerJoin(activities, and(eq(activities.villageId, villages.id), eq(activities.phase, id), isNotNull(activities.classroomId)))
        .innerJoin(medias, eq(medias.activityId, activities.id))
        .where(and(inArray(villages.id, villagesIds), isNotNull(activities.publishDate), isNull(activities.deleteDate), eq(medias.type, 'video')))
        .groupBy(villages.id);

    const totalElements = await db
        .select({ count: countDistinct(villages.id) })
        .from(villages)
        .leftJoin(activities, and(eq(activities.villageId, villages.id), eq(activities.phase, id), isNotNull(activities.classroomId)));

    const result = aggregateActivities(activityResult, draftsCountResult, videosCountResult);
    return NextResponse.json({ ...result, totalElements: totalElements[0].count });
};
