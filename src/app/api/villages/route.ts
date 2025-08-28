import { db } from '@server/database';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { NextResponse } from 'next/server';

export const GET = async () => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const allVillages = await db.query.villages.findMany({
        orderBy: villages.id,
    });
    return NextResponse.json(allVillages);
};
