import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import { medias } from '@server/database/schemas/medias';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, count, countDistinct, desc, eq, inArray, isNull } from 'drizzle-orm';
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
        .selectDistinct({ id: villages.id, publishDate: activities.publishDate })
        .from(activities)
        .innerJoin(villages, eq(activities.villageId, villages.id))
        .where(eq(activities.phase, id))
        .orderBy(desc(activities.publishDate))
        .limit(itemsPerPage)
        .offset((page - 1) * itemsPerPage);

    const villagesIds = paginatedVillages.map((village) => village.id);

    const activityResult = await db
        .select({ count: count(activities.id), type: activities.type, name: villages.name, id: villages.id })
        .from(activities)
        .innerJoin(villages, eq(activities.villageId, villages.id))
        .where(and(eq(activities.phase, id), inArray(activities.villageId, villagesIds)))
        .groupBy(activities.type, villages.id, villages.name);

    const draftsCountResult = await db
        .select({ count: count(), id: villages.id })
        .from(activities)
        .innerJoin(villages, eq(activities.villageId, villages.id))
        .where(and(eq(activities.phase, id), inArray(activities.villageId, villagesIds), isNull(activities.publishDate)))
        .groupBy(villages.id);

    const videosCountResult = await db
        .select({ count: count(), id: villages.id })
        .from(medias)
        .innerJoin(activities, eq(medias.activityId, activities.id))
        .innerJoin(villages, eq(activities.villageId, villages.id))
        .where(and(eq(activities.phase, id), inArray(activities.villageId, villagesIds), eq(medias.type, 'video')))
        .groupBy(villages.id);

    const totalElements = await db
        .select({ count: countDistinct(villages.id) })
        .from(activities)
        .innerJoin(villages, eq(activities.villageId, villages.id))
        .where(eq(activities.phase, id));

    const result = aggregateActivities(activityResult, draftsCountResult, videosCountResult);
    return NextResponse.json({ ...result, totalElements: totalElements[0].count });
};
