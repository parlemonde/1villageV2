import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { count } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export interface StatisticsResponse {
    postsCountPerVillage: Record<number, number>;
}

export const GET = async () => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }
    if (user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const postsCountPerVillage = await db
        .select({
            activityCount: count(activities.id),
            villageId: activities.villageId,
        })
        .from(activities)
        .groupBy(activities.villageId);

    const response: StatisticsResponse = {
        postsCountPerVillage: Object.fromEntries(
            postsCountPerVillage.filter(({ villageId }) => villageId !== null).map(({ villageId, activityCount }) => [villageId, activityCount]),
        ),
    };

    return NextResponse.json(response);
};
