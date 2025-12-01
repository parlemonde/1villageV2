import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
import { ACTIVITY_TYPES_ENUM } from '@server/database/schemas/activity-types';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq, isNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createLoader, parseAsStringEnum } from 'nuqs/server';

const draftActivitySearchParams = {
    type: parseAsStringEnum<ActivityType>(ACTIVITY_TYPES_ENUM),
};
const loadSearchParams = createLoader(draftActivitySearchParams);

export const GET = async ({ nextUrl }: NextRequest) => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const { type } = loadSearchParams(nextUrl.searchParams);

    const draftActivity =
        type !== null
            ? await db.query.activities.findFirst({
                  where: and(
                      isNull(activities.publishDate),
                      isNull(activities.deleteDate),
                      eq(activities.type, type),
                      eq(activities.userId, user.id),
                  ),
              })
            : undefined;

    if (!draftActivity) {
        notFound();
    }

    return NextResponse.json(draftActivity);
};
