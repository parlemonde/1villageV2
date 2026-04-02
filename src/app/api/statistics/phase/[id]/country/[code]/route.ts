import type { PhaseActivitiesResponse, PhaseActivitiesRow } from '@app/api/statistics/phase/[id]/types';
import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
import { classrooms } from '@server/database/schemas/classrooms';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, count, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const GET = async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; code: string }> },
): Promise<NextResponse<PhaseActivitiesResponse>> => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }
    if (user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const { id, code } = await params;
    if (Number.isNaN(id)) {
        return new NextResponse('Invalid Phase Id', { status: 400 });
    }

    const sqlResult = await db
        .select({ count: count(activities.id), type: activities.type, name: classrooms.countryCode })
        .from(activities)
        .innerJoin(classrooms, eq(activities.classroomId, classrooms.id))
        .where(and(eq(activities.phase, Number(id)), eq(classrooms.countryCode, code)))
        .groupBy((a) => [a.name, a.type]);

    const rows: PhaseActivitiesRow[] = [{ name: code, activities: {} }];
    sqlResult.forEach((activity) => {
        rows[0].activities[activity.type as ActivityType] = activity.count;
    });

    return NextResponse.json({ rows, totalElements: rows.length });
};
