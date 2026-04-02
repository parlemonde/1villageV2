import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, count, countDistinct, desc, eq, inArray } from 'drizzle-orm';
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
    { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<PhaseActivitiesResponse>> => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }
    if (user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const { id } = await params;
    if (Number.isNaN(id)) {
        return new NextResponse('Invalid Phase Id', { status: 400 });
    }

    const { page, itemsPerPage } = loadSearchParams(nextUrl.searchParams);

    const paginatedVillages = await db
        .selectDistinct({ id: villages.id, publishDate: activities.publishDate })
        .from(activities)
        .innerJoin(villages, eq(activities.villageId, villages.id))
        .where(eq(activities.phase, Number(id)))
        .orderBy(desc(activities.publishDate))
        .limit(itemsPerPage)
        .offset((page - 1) * itemsPerPage);

    const villagesIds = paginatedVillages.map((village) => village.id);

    const activityResult = await db
        .select({ count: count(activities.id), type: activities.type, name: villages.name })
        .from(activities)
        .innerJoin(villages, eq(activities.villageId, villages.id))
        .where(and(eq(activities.phase, Number(id)), inArray(activities.villageId, villagesIds)))
        .groupBy(villages.name, activities.type);

    const totalElements = await db
        .select({ count: countDistinct(villages.id) })
        .from(activities)
        .innerJoin(villages, eq(activities.villageId, villages.id))
        .where(eq(activities.phase, Number(id)));

    const result = aggregateActivities(activityResult);
    return NextResponse.json({ ...result, totalElements: totalElements[0].count });
};
