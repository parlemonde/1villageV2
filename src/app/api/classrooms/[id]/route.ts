import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const GET = async (_req: Request, { params }: { params: Promise<{ id: number }> }) => {
    const user = await getCurrentUser();

    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const { id } = await params;

    const result = await db.select().from(classrooms).where(eq(classrooms.id, id)).limit(1);

    if (!result) {
        return new NextResponse(null, { status: 404 });
    }

    return NextResponse.json(result[0]);
};
