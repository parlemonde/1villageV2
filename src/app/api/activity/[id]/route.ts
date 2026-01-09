import { getActivity } from '@server/entities/activities/get-activity';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { NextResponse, type NextRequest } from 'next/server';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const GET = async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await sleep(10000);

    const user = await getCurrentUser();
    if (!user) return new NextResponse(null, { status: 401 });

    const activityId = await params;

    if (Number.isNaN(activityId.id)) {
        return new NextResponse('Invalid activity ID', { status: 400 });
    }

    const activity = await getActivity(Number(activityId.id));
    if (!activity) return new NextResponse('Activity not found', { status: 404 });

    return NextResponse.json(activity);
};
