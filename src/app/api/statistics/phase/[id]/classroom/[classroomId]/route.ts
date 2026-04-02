import type { PhaseActivitiesResponse, PhaseActivitiesRow } from '@app/api/statistics/phase/[id]/types';
import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
import { classrooms } from '@server/database/schemas/classrooms';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, count, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getExtracted } from 'next-intl/server';

export const GET = async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; classroomId: string }> },
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
    if (Number.isNaN(id)) {
        return new NextResponse('Invalid Phase Id', { status: 400 });
    }
    if (Number.isNaN(classroomId)) {
        return new NextResponse('Invalid Classroom Id', { status: 400 });
    }

    const result = await db
        .select({ count: count(activities.id), type: activities.type, alias: classrooms.alias, level: classrooms.level, name: classrooms.name })
        .from(activities)
        .innerJoin(classrooms, eq(activities.classroomId, classrooms.id))
        .where(and(eq(activities.phase, Number(id)), eq(activities.classroomId, Number(classroomId))))
        .groupBy((a) => [a.alias, a.level, a.name, a.type]);

    if (result.length === 0) {
        return NextResponse.json({ rows: [], totalElements: 0 });
    }

    const label = result[0]?.alias
        ? result[0].alias
        : result[0]?.level
          ? t('Les ${level} de ${name}', { level: result[0].level, name: result[0].name })
          : result[0]?.name;

    const rows: PhaseActivitiesRow[] = [{ name: label, activities: {} }];
    result.forEach((activity) => {
        rows[0].activities[activity.type as ActivityType] = activity.count;
    });

    return NextResponse.json({ rows, totalElements: result.length });
};
