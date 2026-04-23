import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { NextResponse } from 'next/server';

export const GET = async () => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    if (user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const result = await db.selectDistinct({ country: classrooms.countryCode }).from(classrooms);
    return NextResponse.json(result.map((r) => r.country));
};
