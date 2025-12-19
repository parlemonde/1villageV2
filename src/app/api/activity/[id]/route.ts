import type { Activity } from '@server/database/schemas/activities';
import { getActivity } from '@server/entities/activities/get-activity';
import type { NextRequest } from 'next/server';
import { createLoader, parseAsInteger } from 'nuqs/server';

const activitySearchParams = {
    activityId: parseAsInteger,
};
const loadSearchParams = createLoader(activitySearchParams);

export const GET = async ({ nextUrl }: NextRequest) => {
    const { activityId } = loadSearchParams(nextUrl.searchParams);

    if (Number.isNaN(activityId)) {
        return new Response('Invalid activity ID', { status: 400 });
    }

    const activity: Activity | null = await getActivity(activityId);

    if (!activity) {
        return new Response('Activity not found', { status: 404 });
    }

    return Response.json(activity);
};
