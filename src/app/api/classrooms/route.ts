import { db } from '@server/database';
import type { Classroom } from '@server/database/schemas/classrooms';
import { classrooms } from '@server/database/schemas/classrooms';
import { users } from '@server/database/schemas/users';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq, and } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server';

const classroomsSearchParams = {
    villageId: parseAsInteger,
    country: parseAsString,
};
const loadSearchParams = createLoader(classroomsSearchParams);

export type ClassroomVillageTeacher = {
    classroom: Classroom;
    villageName: string | null;
    teacherName: string | null;
};

const getVillageClassrooms = async (villageId: number | null): Promise<ClassroomVillageTeacher[]> => {
    //Start building the query
    const query = db
        .select({ classroom: classrooms, villageName: villages?.name, teacherName: users.name })
        .from(classrooms)
        .leftJoin(villages, eq(villages.id, classrooms.villageId))
        .leftJoin(users, eq(users.id, classrooms.teacherId));

    //Add filter only if villageId is provided
    if (villageId !== null) {
        query.where(eq(classrooms.villageId, villageId));
    }

    //Execute the query
    const result = await query;
    return result;
}
const getCountryClassrooms = async (country: string): Promise<Classroom[]> => {
    return await db.select().from(classrooms).where(eq(classrooms.countryCode, country));
};

const getVillageCountryClassrooms = async (villageId: number, country: string): Promise<Classroom[]> => {
    return await db
        .select()
        .from(classrooms)
        .where(and(eq(classrooms.villageId, villageId), eq(classrooms.countryCode, country)));
};

const getAllClassrooms = async (): Promise<Classroom[]> => {
    return await db.select().from(classrooms).orderBy(classrooms.id);
};

const buildQuery = async (villageId: number | null, country: string | null) => {
    if (villageId && country) {
        return await getVillageCountryClassrooms(villageId, country);
    } else if (villageId) {
        return await getVillageClassrooms(villageId);
    } else if (country) {
        return await getCountryClassrooms(country);
    }

    return await getAllClassrooms();
};

export const GET = async ({ nextUrl }: NextRequest) => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const { villageId, country } = loadSearchParams(nextUrl.searchParams);
    if (!villageId && user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const result = await buildQuery(villageId, country);
    return NextResponse.json(result);
};
