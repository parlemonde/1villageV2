import type { PhaseActivitiesResponse, PhaseActivitiesRow } from '@app/api/statistics/phase/[id]/types';
import { COUNTRIES } from '@lib/iso-3166-countries-french';
import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
import { classrooms } from '@server/database/schemas/classrooms';
import { medias } from '@server/database/schemas/medias';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, count, eq, isNull } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const GET = async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: number; code: string }> },
): Promise<NextResponse<PhaseActivitiesResponse>> => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }
    if (user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const { id, code } = await params;

    const sqlResult = await db
        .select({ count: count(activities.id), type: activities.type })
        .from(activities)
        .innerJoin(classrooms, eq(activities.classroomId, classrooms.id))
        .where(and(eq(activities.phase, id), eq(classrooms.countryCode, code)))
        .groupBy((a) => [a.type]);

    const draftCount = await db
        .select({ count: count(activities.id) })
        .from(activities)
        .innerJoin(classrooms, eq(activities.classroomId, classrooms.id))
        .where(and(eq(activities.phase, id), eq(classrooms.countryCode, code), isNull(activities.publishDate)));

    const videoCount = await db
        .select({ count: count(medias.id) })
        .from(medias)
        .innerJoin(activities, eq(medias.activityId, activities.id))
        .innerJoin(classrooms, eq(activities.classroomId, classrooms.id))
        .where(and(eq(activities.phase, id), eq(classrooms.countryCode, code), eq(medias.type, 'video')));

    const rows: PhaseActivitiesRow[] = [{ id: code, name: COUNTRIES[code] ?? '', activities: {} }];
    sqlResult.forEach((activity) => {
        rows[0].activities[activity.type as ActivityType] = activity.count;
    });

    rows[0].activities.draft = draftCount[0]?.count;
    rows[0].activities.video = videoCount[0]?.count;

    return NextResponse.json({ rows, totalElements: rows.length });
};
