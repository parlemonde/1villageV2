import { db } from '@server/database';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsInteger } from 'nuqs/server';

const GetVillagesParams = {
    villageId: parseAsInteger,
};

const loadSearchParams = createLoader(GetVillagesParams);

export const GET = async ({ nextUrl }: NextRequest) => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const { villageId } = loadSearchParams(nextUrl.searchParams);

    const allVillages = await db.query.villages.findMany({
        where: villageId ? eq(villages.id, villageId) : undefined,
        orderBy: villages.id,
    });
    return NextResponse.json(allVillages);
};
