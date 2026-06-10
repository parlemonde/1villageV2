import { aggregateActivities } from '@app/api/statistics/phase/[id]/helpers';
import type { PhaseActivitiesResponse } from '@app/api/statistics/phase/[id]/types';
import { COUNTRIES } from '@lib/iso-3166-countries-french';
import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import { classrooms } from '@server/database/schemas/classrooms';
import { medias } from '@server/database/schemas/medias';
import { villages } from '@server/database/schemas/villages';
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

    const { page, itemsPerPage } = loadSearchParams(nextUrl.searchParams);

    const countriesInVillage = await db.select({ countries: villages.countries }).from(villages).where(eq(villages.id, villageId));
    const allCountries = countriesInVillage[0]?.countries ?? [];
    const paginatedCountries = allCountries.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const activityResult = await db
        .select({
            count: count(activities.id),
            type: activities.type,
            entityId: classrooms.countryCode,
            name: classrooms.countryCode,
        })
        .from(classrooms)
        .innerJoin(activities, and(eq(activities.classroomId, classrooms.id), eq(activities.villageId, villageId)))
        .where(
            and(
                eq(activities.phase, id),
                eq(classrooms.villageId, villageId),
                inArray(classrooms.countryCode, paginatedCountries),
                isNotNull(activities.publishDate),
                isNull(activities.deleteDate),
            ),
        )
        .groupBy((a) => [a.type, a.entityId]);

    activityResult.forEach((r) => {
        const countryLabel = COUNTRIES[r.name];
        if (countryLabel) {
            r.name = countryLabel;
        }
    });

    const draftCount = await db
        .select({ count: count(activities.id), entityId: classrooms.countryCode })
        .from(activities)
        .innerJoin(classrooms, and(eq(activities.classroomId, classrooms.id), eq(activities.villageId, villageId)))
        .where(and(eq(activities.phase, id), eq(classrooms.villageId, villageId), isNull(activities.publishDate), isNull(activities.deleteDate)))
        .groupBy(classrooms.countryCode);

    const videoCount = await db
        .select({ count: count(medias.id), entityId: classrooms.countryCode })
        .from(medias)
        .innerJoin(activities, eq(medias.activityId, activities.id))
        .innerJoin(classrooms, and(eq(activities.classroomId, classrooms.id), eq(activities.villageId, villageId)))
        .where(
            and(
                eq(activities.phase, id),
                eq(classrooms.villageId, villageId),
                isNotNull(activities.publishDate),
                isNull(activities.deleteDate),
                eq(medias.type, 'video'),
            ),
        )
        .groupBy(classrooms.countryCode);

    const totals = await db
        .select({
            type: activities.type,
            count: count(sql`CASE WHEN ${activities.publishDate} IS NOT NULL THEN 1 END`),
            draftCount: count(sql`CASE WHEN ${activities.publishDate} IS NULL THEN 1 END`),
            videoCount: countDistinct(sql`CASE WHEN ${medias.id} IS NOT NULL THEN ${medias.id} END`),
        })
        .from(activities)
        .innerJoin(classrooms, and(eq(activities.classroomId, classrooms.id), eq(classrooms.villageId, villageId)))
        .leftJoin(medias, and(eq(medias.activityId, activities.id), eq(medias.type, 'video')))
        .where(and(eq(activities.phase, id), isNotNull(activities.classroomId), isNull(activities.deleteDate), eq(activities.villageId, villageId)))
        .groupBy(activities.type);

    const result = aggregateActivities(activityResult, draftCount, videoCount, totals, paginatedCountries);

    return NextResponse.json({ ...result, totalElements: allCountries.length });
};
