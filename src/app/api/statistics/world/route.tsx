import { db } from '@server/database';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export type WorldStats = {
    country: string;
    status: 'active' | 'observer' | 'ghost';
};

export const GET = async () => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }
    if (user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const results = await db.execute<WorldStats>(sql`
    WITH latest_session AS (
        SELECT
            user_id,
            MAX(updated_at) AS "lastSeen"
        FROM "auth_sessions"
        GROUP BY user_id
    ),
    stats AS (
        SELECT
            "classrooms"."countryCode" AS country,
            COUNT(DISTINCT "classrooms"."id") AS total,
            COUNT(DISTINCT "activities"."classroomId") FILTER (WHERE "activities"."publishDate" >= NOW() - INTERVAL '21 days') AS hasPostedRecently,
            COUNT(DISTINCT "users"."id") FILTER (WHERE "latest_session"."lastSeen" < NOW() - INTERVAL '21 days' OR "latest_session"."lastSeen" IS NULL) AS ghost
        FROM "activities"
        RIGHT JOIN "classrooms" ON "activities"."classroomId" = "classrooms"."id"
        INNER JOIN "users" ON "classrooms"."teacherId" = "users"."id"
        LEFT JOIN "latest_session" ON "users"."id" = "latest_session"."user_id"
        GROUP BY "classrooms"."countryCode"
    )
    SELECT "country", 
    CASE
        WHEN hasPostedRecently >= total * 0.5 THEN 'active'
        WHEN ghost >= total * 0.5 THEN 'ghost'
        ELSE 'observer'
    END AS status
    FROM stats;`);

    return NextResponse.json(results.rows);
};
