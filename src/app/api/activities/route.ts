import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
import { ACTIVITY_TYPES_ENUM } from '@server/database/schemas/activity-types';
import { activityVisibility } from '@server/database/schemas/activity-visibility';
import { classrooms } from '@server/database/schemas/classrooms';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq, ilike, inArray, isNotNull, isNull, or, sql, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { parseAsBoolean, createLoader, parseAsArrayOf, parseAsString, parseAsInteger, parseAsStringEnum } from 'nuqs/server';

const activitiesSearchParams = {
    activityId: parseAsInteger,
    search: parseAsString,
    phase: parseAsInteger,
    type: parseAsArrayOf(parseAsStringEnum<ActivityType>(ACTIVITY_TYPES_ENUM)),
    villageId: parseAsInteger, // -1 will mean null village activities
    isPelico: parseAsBoolean,
    countries: parseAsArrayOf(parseAsString),
    visibility: parseAsStringEnum<'all' | 'visible' | 'hidden' | 'hidden'>(['all', 'visible', 'hidden']).withDefault('visible'),
};
const loadSearchParams = createLoader(activitiesSearchParams);

export const GET = async ({ nextUrl }: NextRequest) => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const { activityId, search, phase, villageId, type, isPelico, countries, visibility } = loadSearchParams(nextUrl.searchParams);

    if (activityId) {
        const result = await db.query.activities.findFirst({
            where: eq(activities.id, activityId),
        });
        if (!result) {
            return new NextResponse(null, { status: 404 });
        }
        return NextResponse.json(result);
    }

    // Users should only access their own village activities
    if ((villageId === null || villageId === -1) && user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const result = await db
        .select({
            activity: { ...activities, isHidden: activityVisibility.isHidden },
        })
        .from(activities)
        .innerJoin(activityVisibility, eq(activityVisibility.activityId, activities.id))
        .leftJoin(classrooms, eq(activities.classroomId, classrooms.id)) // Used to filter by countries
        .where(
            and(
                visibility === 'visible'
                    ? eq(activityVisibility.isHidden, false)
                    : visibility === 'hidden'
                      ? eq(activityVisibility.isHidden, true)
                      : undefined,
                isNotNull(activities.publishDate),
                isNull(activities.deleteDate),
                search !== null
                    ? or(
                          ilike(activities.type, `%${search}%`),
                          sql`jsonb_path_exists("activities"."data", ${`$.** ? (@.type() == "string" && @ like_regex "(?i)${search}")`})`,
                      )
                    : undefined,
                type !== null && type.length > 0 ? inArray(activities.type, type) : undefined,
                phase !== null ? eq(activities.phase, phase) : undefined,
                villageId === -1 ? isNull(activities.villageId) : villageId !== null ? eq(activities.villageId, villageId) : undefined,
                isPelico === false ? eq(activities.isPelico, false) : undefined,
                countries !== null ? or(inArray(classrooms.countryCode, countries), isNull(activities.classroomId)) : undefined,
            ),
        )
        .orderBy(desc(activities.isPinned), desc(activities.publishDate));
    const allActivities = result.map(({ activity }) => activity);
    return NextResponse.json(allActivities);
};
