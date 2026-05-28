import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const GET = async () => {
    const user = await getCurrentUser();

    if (!user || user.role !== 'teacher') {
        return new NextResponse(null, { status: 401 });
    }

    const result = await db.select().from(classrooms).where(eq(classrooms.teacherId, user.id));
    return NextResponse.json(result);
};
