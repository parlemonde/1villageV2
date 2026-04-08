import type { PhaseActivitiesResponse, PhaseActivitiesRow } from '@app/api/statistics/phase/[id]/types';
import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
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

    const result = await db
        .select({
            count: count(activities.id),
            type: activities.type,
            alias: classrooms.alias,
            level: classrooms.level,
            name: classrooms.name,
            id: classrooms.id,
        })
        .from(activities)
        .innerJoin(classrooms, eq(activities.classroomId, classrooms.id))
        .where(and(eq(activities.phase, id), eq(activities.classroomId, classroomId)))
        .groupBy((a) => [a.alias, a.level, a.name, a.id, a.type]);

    if (result.length === 0) {
        return NextResponse.json({ rows: [], totalElements: 0 });
    }

    const draftCount = await db
        .select({ count: count(activities.id) })
        .from(activities)
        .innerJoin(classrooms, eq(activities.classroomId, classrooms.id))
        .where(and(eq(activities.phase, id), eq(activities.classroomId, classroomId), isNull(activities.publishDate)));

    const videoCount = await db
        .select({ count: count(medias.id) })
        .from(medias)
        .innerJoin(activities, eq(medias.activityId, activities.id))
        .innerJoin(classrooms, eq(activities.classroomId, classrooms.id))
        .where(and(eq(activities.phase, id), eq(activities.classroomId, classroomId), eq(medias.type, 'video')));

    const label = result[0]?.alias
        ? result[0].alias
        : result[0]?.level
          ? t('Les ${level} de ${name}', { level: result[0].level, name: result[0].name })
          : result[0]?.name;

    const rows: PhaseActivitiesRow[] = [{ id: result[0].id, name: label, activities: {} }];
    result.forEach((activity) => {
        rows[0].activities[activity.type as ActivityType] = activity.count;
    });

    rows[0].activities.draft = draftCount[0]?.count;
    rows[0].activities.video = videoCount[0]?.count;

    return NextResponse.json({ rows, totalElements: result.length });
};
