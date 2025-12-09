import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { users } from '@server/database/schemas/users';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsInteger } from 'nuqs/server';

const classroomsSearchParams = {
    villageId: parseAsInteger,
};
const loadSearchParams = createLoader(classroomsSearchParams);

const getVillageClassrooms = async (villageId: number | null) => {
    //Start building the query
    let query = db
        .select({ classroom: classrooms, villageName: villages?.name, teacherName: users.name })
        .from(classrooms)
        .leftJoin(villages, eq(villages.id, classrooms.villageId))
        .leftJoin(users, eq(users.id, classrooms.teacherId));

    //Add filter only if villageId is provided
    if (villageId !== null) {
        query = query.where(eq(classrooms.villageId, villageId));
    }

    //Execute the query
    const result = await query;
    return result;
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
        return NextResponse.json(await getVillageClassrooms(null));
    }
};
