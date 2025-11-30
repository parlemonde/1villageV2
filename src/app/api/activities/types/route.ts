import { db } from '@server/database';
import { phaseActivityTypes } from '@server/database/schemas/activity-types';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsInteger } from 'nuqs/server';

const activityTypesSearchParams = {
    phase: parseAsInteger.withDefault(0),
};
const loadSearchParams = createLoader(activityTypesSearchParams);

export const GET = async ({ nextUrl }: NextRequest) => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }
    const { phase } = loadSearchParams(nextUrl.searchParams);
    const types = await db.query.phaseActivityTypes.findFirst({
        where: eq(phaseActivityTypes.phase, phase),
    });
    return NextResponse.json(types?.activityTypes ?? []);
};
