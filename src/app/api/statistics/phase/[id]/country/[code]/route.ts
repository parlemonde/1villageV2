import { aggregateActivities } from '@app/api/statistics/phase/[id]/helpers';
import type { PhaseActivitiesResponse } from '@app/api/statistics/phase/[id]/types';
import { COUNTRIES } from '@lib/iso-3166-countries-french';
import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import { classrooms } from '@server/database/schemas/classrooms';
import { medias } from '@server/database/schemas/medias';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, count, countDistinct, eq, inArray, isNotNull, isNull, sql } from 'drizzle-orm';
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
    { params }: { params: Promise<{ id: number; code: string }> },
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

    const paginatedCountries = await db
        .select({ id: classrooms.countryCode })
        .from(classrooms)
        .offset((page - 1) * itemsPerPage)
        .limit(itemsPerPage);
    const countryIds = paginatedCountries.map((country) => country.id);

    const activityResult = await db
        .select({ count: count(activities.id), type: activities.type, id: classrooms.countryCode, name: classrooms.countryCode })
        .from(classrooms)
        .leftJoin(
            activities,
            and(
                eq(activities.classroomId, classrooms.id),
                eq(activities.phase, id),
                isNotNull(activities.classroomId),
                isNotNull(activities.publishDate),
            ),
        )
        .where(and(inArray(classrooms.countryCode, countryIds), isNull(activities.deleteDate)))
        .groupBy((a) => [a.id, a.type]);

    activityResult.forEach((a) => {
        a.name = COUNTRIES[a.name] ?? a.name;
    });

    const draftCount = await db
        .select({ count: count(activities.id), id: classrooms.countryCode })
        .from(classrooms)
        .innerJoin(activities, eq(activities.classroomId, classrooms.id))
        .where(and(eq(activities.phase, id), inArray(classrooms.countryCode, countryIds), isNull(activities.publishDate)))
        .groupBy((a) => [a.id]);

    const videoCount = await db
        .select({ count: count(medias.id), id: classrooms.countryCode })
        .from(medias)
        .innerJoin(activities, eq(medias.activityId, activities.id))
        .innerJoin(classrooms, eq(activities.classroomId, classrooms.id))
        .where(
            and(
                eq(activities.phase, id),
                inArray(classrooms.countryCode, countryIds),
                isNotNull(activities.publishDate),
                isNull(activities.deleteDate),
                eq(medias.type, 'video'),
            ),
        )
        .groupBy((a) => [a.id]);

    const totalElements = await db.select({ count: countDistinct(classrooms.countryCode) }).from(classrooms);

    const totals = await db
        .select({
            type: activities.type,
            count: count(sql`CASE WHEN ${activities.publishDate} IS NOT NULL THEN 1 END`),
            draftCount: count(sql`CASE WHEN ${activities.publishDate} IS NULL THEN 1 END`),
            videoCount: countDistinct(sql`CASE WHEN ${medias.id} IS NOT NULL THEN ${medias.id} END`),
        })
        .from(activities)
        .leftJoin(medias, and(eq(medias.activityId, activities.id), eq(medias.type, 'video')))
        .where(and(eq(activities.phase, id), isNotNull(activities.classroomId), isNull(activities.deleteDate)))
        .groupBy(activities.type);

    const result = aggregateActivities(activityResult, draftCount, videoCount, totals);

    return NextResponse.json({ ...result, totalElements: totalElements[0]?.count });
};
