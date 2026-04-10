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
import { getExtracted } from 'next-intl/server';

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

    const villageIdResponse = await db.select({ villageId: classrooms.villageId }).from(classrooms).where(eq(classrooms.id, classroomId));
    const villageId = villageIdResponse[0]?.villageId;

    if (!villageId) {
        return new NextResponse(null, { status: 422 });
    }

    const sqlResult = await db
        .select({
            count: count(activities.id),
            type: activities.type,
            alias: classrooms.alias,
            level: classrooms.level,
            name: classrooms.name,
            id: classrooms.id,
        })
        .from(classrooms)
        .leftJoin(activities, and(eq(activities.classroomId, classrooms.id), eq(activities.phase, id)))
        .where(eq(classrooms.villageId, villageId))
        .groupBy((a) => [a.alias, a.level, a.name, a.id, a.type]);

    const draftCount = await db
        .select({ count: count(activities.id), id: classrooms.id })
        .from(classrooms)
        .innerJoin(activities, eq(classrooms.id, activities.classroomId))
        .where(and(eq(activities.villageId, villageId), eq(activities.phase, id), isNull(activities.publishDate)))
        .groupBy(classrooms.id);

    const videoCount = await db
        .select({ count: count(medias.id), id: classrooms.id })
        .from(medias)
        .innerJoin(activities, eq(medias.activityId, activities.id))
        .innerJoin(classrooms, eq(classrooms.id, activities.classroomId))
        .where(and(eq(activities.villageId, villageId), eq(activities.phase, id), eq(medias.type, 'video')))
        .groupBy(classrooms.id);

    sqlResult.forEach((r) => {
        const label = r?.alias ? r.alias : r?.level ? t('Les {level} de {name}', { level: r.level, name: r.name }) : r?.name;
        r.name = label;
    });

    const totalElements = await db.select({ count: count() }).from(classrooms).where(eq(classrooms.villageId, villageId));

    const result = aggregateActivities(sqlResult, draftCount, videoCount);

    return NextResponse.json({ ...result, totalElements: totalElements[0]?.count });
};
