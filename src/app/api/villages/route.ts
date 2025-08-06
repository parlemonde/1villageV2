import { NextResponse } from 'next/server';

import { db } from '@/database';
import { villages } from '@/database/schemas/villages';
import { getCurrentUser } from '@/server-functions/getCurrentUser';

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
