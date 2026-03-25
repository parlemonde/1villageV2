import { db } from '@server/database';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { sql } from 'drizzle-orm';
import { NextResponse, type NextRequest } from 'next/server';
import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server';

const statusSearchParams = {
    countryCode: parseAsString,
    villageId: parseAsInteger,
    classroomId: parseAsInteger,
};

const loadSearchParams = createLoader(statusSearchParams);

export const GET = async ({ nextUrl }: NextRequest) => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }
    if (user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const { countryCode, villageId, classroomId } = loadSearchParams(nextUrl.searchParams);

    if (!countryCode && !villageId && !classroomId) {
        return new NextResponse('Missing country code, village id or classroom id', { status: 400 });
    }

    const result = classroomId ? await getClassroomStatus(classroomId) : await getVillageOrCountryStatus(villageId, countryCode);
    return NextResponse.json(result);
};

const getClassroomStatus = async (classroomId: number) => {
    const result = await db.execute<{ status: string }>(sql`
        SELECT
            CASE
                WHEN
                    MAX("activities"."publishDate") > NOW() - INTERVAL '21 days'
                THEN 'active'
                WHEN
                    MAX("auth_sessions"."updated_at") < NOW() - INTERVAL '21 days' OR MAX("auth_sessions"."updated_at") IS NULL
                THEN 'ghost'
                ELSE 'observer'
            END AS status
        FROM "activities"
        INNER JOIN "classrooms" ON "activities"."classroomId" = "classrooms"."id"
        INNER JOIN "users" ON "activities"."userId" = "users"."id"
        LEFT JOIN "auth_sessions" ON "users"."id" = "auth_sessions"."user_id"
        WHERE "classrooms"."id" = ${classroomId}
    `);

    return result.rows[0].status;
};

const getVillageOrCountryStatus = async (villageId: number | null, countryCode: string | null) => {
    const filter = villageId ? sql`"classrooms"."villageId" = ${villageId}` : sql`"classrooms"."countryCode" = ${countryCode}`;

    const result = await db.execute<{ status: 'active' | 'ghost' | 'observer' | 'none' }>(sql`
        WITH stats AS (
            SELECT
                COUNT(DISTINCT "classrooms"."id") AS total,
                COUNT(DISTINCT "activities"."classroomId") FILTER (WHERE "activities"."publishDate" >= NOW() - INTERVAL '21 days') AS hasPostedRecently,
                COUNT(DISTINCT "users"."id") FILTER (WHERE "auth_sessions"."updated_at" < NOW() - INTERVAL '21 days' OR "auth_sessions"."updated_at" IS NULL) AS ghost
            FROM "activities"
            INNER JOIN "classrooms" ON "activities"."classroomId" = "classrooms"."id"
            INNER JOIN "users" ON "activities"."userId" = "users"."id"
            LEFT JOIN "auth_sessions" ON "users"."id" = "auth_sessions"."user_id"
            WHERE ${filter}
        )
        SELECT CASE
            WHEN total = 0 THEN NULL
            WHEN hasPostedRecently >= total * 0.5 THEN 'active'
            WHEN ghost >= total * 0.5 THEN 'ghost'
            ELSE 'observer'
        END AS status
        FROM stats;
    `);

    return result.rows[0].status;
};
