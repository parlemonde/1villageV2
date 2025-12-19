import type { Activity } from '@server/database/schemas/activities';
import { getActivity } from '@server/entities/activities/get-activity';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { NextResponse, type NextRequest } from 'next/server';
import { createLoader, parseAsInteger } from 'nuqs/server';

const activitySearchParams = {
    activityId: parseAsInteger,
};
const loadSearchParams = createLoader(activitySearchParams);

export const GET = async ({ nextUrl }: NextRequest) => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const { activityId } = loadSearchParams(nextUrl.searchParams);

    if (activityId === null || Number.isNaN(activityId)) {
        return new NextResponse('Invalid activity ID', { status: 400 });
    }

    const activity: Activity | null = await getActivity(activityId);

    if (!activity) {
        return new NextResponse('Activity not found', { status: 404 });
    }

    return NextResponse.json(activity);
};
