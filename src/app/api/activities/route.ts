import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
import { ACTIVITY_TYPES_ENUM } from '@server/database/schemas/activity-types';
import { classrooms } from '@server/database/schemas/classrooms';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq, ilike, inArray, isNotNull, isNull, or, sql, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { parseAsBoolean, createLoader, parseAsArrayOf, parseAsString, parseAsInteger, parseAsStringEnum } from 'nuqs/server';

const activitiesSearchParams = {
    search: parseAsString,
    phase: parseAsInteger,
    type: parseAsArrayOf(parseAsStringEnum<ActivityType>(ACTIVITY_TYPES_ENUM)),
    villageId: parseAsInteger, // -1 will mean null village activities
    isPelico: parseAsBoolean,
    countries: parseAsArrayOf(parseAsString),
};
const loadSearchParams = createLoader(activitiesSearchParams);

export const GET = async ({ nextUrl }: NextRequest) => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const { search, phase, villageId, type, isPelico, countries } = loadSearchParams(nextUrl.searchParams);

    // Users should only access their own village activities
    if ((villageId === null || villageId === -1) && user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const result = await db
        .select({
            activity: activities,
        })
        .from(activities)
        .leftJoin(classrooms, eq(activities.classroomId, classrooms.id)) // Used to filter by countries
        .where(
            and(
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
