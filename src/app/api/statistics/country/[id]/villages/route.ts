import { db } from '@server/database';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export type VillageCountryStatus = {
    villageId: number;
    villageName: string;
    status: 'active' | 'observer' | 'ghost';
};

export const GET = async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse<VillageCountryStatus[]>> => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }
    if (user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const { id: countryCode } = await params;

    const results = await db.execute<VillageCountryStatus>(sql`
    WITH classroom_stats AS (
        SELECT
            "villages"."id" AS "villageId",
            "villages"."name" AS "villageName",
            "classrooms"."id",
            BOOL_OR("activities"."publishDate" >= NOW() - INTERVAL '21 days') as hasPostedRecently,
            MAX("auth_sessions"."updated_at") AS lastSeen
        FROM "villages"
        INNER JOIN "classrooms" on "classrooms"."villageId" = "villages"."id"
        INNER JOIN "users" ON "classrooms"."teacherId" = "users"."id"
        LEFT JOIN "activities" ON "activities"."classroomId" = "classrooms"."id"
        LEFT JOIN "auth_sessions" ON "users"."id" = "auth_sessions"."user_id"
        WHERE "classrooms"."countryCode" = ${countryCode}
        GROUP BY "villages"."name", "villages"."id", "classrooms"."id"
    ),
    stats AS (
        SELECT
            "villageName",
            "villageId",
            COUNT(*) AS total,
            COUNT(*) FILTER (
                WHERE hasPostedRecently
            ) AS active,
            COUNT(*) FILTER (
                WHERE lastSeen < NOW() - INTERVAL '21 days'
                OR lastSeen IS NULL
            ) AS ghost
        FROM classroom_stats
        GROUP BY "villageName", "villageId"
    )
    SELECT
        "villageName",
        "villageId",
        CASE
            WHEN active >= total * 0.5 THEN 'active'
            WHEN ghost >= total * 0.5 THEN 'ghost'
            ELSE 'observer'
        END AS status
    FROM stats;`);

    return NextResponse.json(results.rows);
};
