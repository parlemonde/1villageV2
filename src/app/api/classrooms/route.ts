import { db } from '@server/database';
import type { Classroom } from '@server/database/schemas/classrooms';
import { classrooms } from '@server/database/schemas/classrooms';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsInteger } from 'nuqs/server';

const classroomsSearchParams = {
    villageId: parseAsInteger,
};
const loadSearchParams = createLoader(classroomsSearchParams);

const getVillageClassrooms = async (villageId: number): Promise<Classroom[]> => {
    return await db.select().from(classrooms).where(eq(classrooms.villageId, villageId));
};

const getAllClassrooms = async (): Promise<Classroom[]> => {
    return await db.select().from(classrooms).orderBy(classrooms.id);
};

export const GET = async ({ nextUrl }: NextRequest) => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const { villageId } = loadSearchParams(nextUrl.searchParams);
    if (villageId !== null) {
        return NextResponse.json(await getVillageClassrooms(villageId));
    } else {
        if (user.role !== 'admin') {
            return new NextResponse(null, { status: 403 });
        }
        return NextResponse.json(await getAllClassrooms());
    }
};
