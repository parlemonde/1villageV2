import { db } from '@server/database';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server';

const countryEngagementSearchParams = {
    country: parseAsString,
    villageId: parseAsInteger,
};

const loadSearchParams = createLoader(countryEngagementSearchParams);

export type ClassroomEngagement = {
    count: number;
    status: 'active' | 'observer' | 'ghost';
};

export const GET = async ({ nextUrl }: NextRequest) => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }
    if (user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const { country, villageId } = loadSearchParams(nextUrl.searchParams);

    if (!country && !villageId) {
        return new NextResponse('Missing country or villageId', { status: 400 });
    }

    const result = await db.execute<ClassroomEngagement>(sql`
        WITH stats AS (
            SELECT
                "classrooms"."id" AS "classroomId",
                EXISTS (
                    SELECT 1
                    FROM "activities"
                    WHERE "activities"."classroomId" = "classrooms"."id"
                    AND "activities"."publishDate" >= NOW() - INTERVAL '21 days'
                ) AS hasPostedRecently,
                (
                    SELECT MAX("auth_sessions"."updated_at")
                    FROM "auth_sessions"
                    WHERE "auth_sessions"."user_id" = "classrooms"."teacherId"
                ) AS lastSeen
            FROM "classrooms"
            INNER JOIN "villages" ON "villages"."id" = "classrooms"."villageId"
            WHERE 1 = 1
            ${country ? sql`AND "classrooms"."countryCode" = ${country}` : sql``}
            ${villageId ? sql`AND "classrooms"."villageId" = ${villageId}` : sql``}
        )
        SELECT
            COUNT("classroomId")::int AS count,
            CASE
                WHEN hasPostedRecently THEN 'active'
                WHEN lastSeen < NOW() - INTERVAL '21 days' OR lastSeen IS NULL THEN 'ghost'
                ELSE 'observer'
            END AS status
        FROM stats
        GROUP BY status;
    `);

    return NextResponse.json(result.rows);
};
