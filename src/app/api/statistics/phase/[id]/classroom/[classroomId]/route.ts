import { aggregateActivities } from '@app/api/statistics/phase/[id]/helpers';
import type { PhaseActivitiesResponse } from '@app/api/statistics/phase/[id]/types';
import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import { classrooms } from '@server/database/schemas/classrooms';
import { medias } from '@server/database/schemas/medias';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, count, countDistinct, eq, inArray, isNotNull, isNull, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getExtracted } from 'next-intl/server';
import { createLoader, parseAsInteger } from 'nuqs/server';

const phaseActivitiesSearchParams = {
    page: parseAsInteger.withDefault(1),
    itemsPerPage: parseAsInteger.withDefault(10),
};

const loadSearchParams = createLoader(phaseActivitiesSearchParams);

export const GET = async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: number; classroomId: number }> },
): Promise<NextResponse<PhaseActivitiesResponse>> => {
    const t = await getExtracted('common');

    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }
    if (user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const { id, classroomId } = await params;

    const { page, itemsPerPage } = loadSearchParams(_request.nextUrl.searchParams);

    const villageIdResponse = await db.select({ villageId: classrooms.villageId }).from(classrooms).where(eq(classrooms.id, classroomId));
    const villageId = villageIdResponse[0]?.villageId;

    if (!villageId) {
        return new NextResponse(null, { status: 422 });
    }

    const paginatedClassrooms = await db
        .select({ id: classrooms.id })
        .from(classrooms)
        .where(eq(classrooms.villageId, villageId))
        .limit(itemsPerPage)
        .offset((page - 1) * itemsPerPage);
    const classroomIds = paginatedClassrooms.map((classroom) => classroom.id);

    const activityResult = await db
        .select({
            count: count(activities.id),
            type: activities.type,
            alias: classrooms.alias,
            level: classrooms.level,
            name: classrooms.name,
            id: classrooms.id,
        })
        .from(classrooms)
        .leftJoin(
            activities,
            and(
                eq(activities.classroomId, classrooms.id),
                eq(activities.phase, id),
                isNull(activities.deleteDate),
                isNotNull(activities.publishDate),
            ),
        )
        .where(inArray(classrooms.id, classroomIds))
        .groupBy((a) => [a.id, a.type]);

    const draftCount = await db
        .select({ count: count(activities.id), id: classrooms.id })
        .from(classrooms)
        .innerJoin(activities, eq(classrooms.id, activities.classroomId))
        .where(and(inArray(classrooms.id, classroomIds), eq(activities.phase, id), isNull(activities.publishDate)))
        .groupBy(classrooms.id);

    const videoCount = await db
        .select({ count: count(medias.id), id: classrooms.id })
        .from(medias)
        .innerJoin(activities, eq(medias.activityId, activities.id))
        .innerJoin(classrooms, eq(classrooms.id, activities.classroomId))
        .where(
            and(
                inArray(classrooms.id, classroomIds),
                eq(activities.phase, id),
                isNotNull(activities.publishDate),
                isNull(activities.deleteDate),
                eq(medias.type, 'video'),
            ),
        )
        .groupBy(classrooms.id);

    activityResult.forEach((r) => {
        const label = r?.alias ? r.alias : r?.level ? t('Les {level} de {name}', { level: r.level, name: r.name }) : r?.name;
        r.name = label;
    });

    const totals = await db
        .select({
            type: activities.type,
            count: count(sql`CASE WHEN ${activities.publishDate} IS NOT NULL THEN 1 END`),
            draftCount: count(sql`CASE WHEN ${activities.publishDate} IS NULL THEN 1 END`),
            videoCount: countDistinct(sql`CASE WHEN ${medias.id} IS NOT NULL THEN ${medias.id} END`),
        })
        .from(activities)
        .leftJoin(medias, and(eq(medias.activityId, activities.id), eq(medias.type, 'video')))
        .where(and(eq(activities.phase, id), isNotNull(activities.classroomId), isNull(activities.deleteDate), eq(activities.villageId, villageId)))
        .groupBy(activities.type);

    const totalElements = await db.select({ count: count() }).from(classrooms).where(eq(classrooms.villageId, villageId));

    const result = aggregateActivities(activityResult, draftCount, videoCount, totals);

    return NextResponse.json({ ...result, totalElements: totalElements[0]?.count });
};
