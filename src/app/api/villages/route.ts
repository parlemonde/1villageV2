import { db } from '@server/database';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server';

const GetVillagesParams = {
    villageId: parseAsInteger,
    country: parseAsString,
};

const loadSearchParams = createLoader(GetVillagesParams);

export const GET = async ({ nextUrl }: NextRequest) => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const { villageId, country } = loadSearchParams(nextUrl.searchParams);

    const allVillages = await db.query.villages.findMany({
        where: and(villageId ? eq(villages.id, villageId) : undefined, country ? sql`${villages.countries} ? ${country}` : undefined),
        orderBy: villages.id,
    });
    return NextResponse.json(allVillages);
};
