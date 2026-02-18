import { db } from '@server/database';
import type { Classroom } from '@server/database/schemas/classrooms';
import { classrooms } from '@server/database/schemas/classrooms';
import { users } from '@server/database/schemas/users';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq, and } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsBoolean, parseAsInteger, parseAsString } from 'nuqs/server';

const classroomsSearchParams = {
    villageId: parseAsInteger,
    country: parseAsString,
    withVillage: parseAsBoolean.withDefault(false),
    classroomId: parseAsInteger,
};
const loadSearchParams = createLoader(classroomsSearchParams);

export type ClassroomVillageTeacher = {
    classroom: Classroom;
    villageName: string | null;
    teacherName: string | null;
};

const getVillageClassroomsWithVillage = async (villageId: number | null): Promise<ClassroomVillageTeacher[]> => {
    const query = db
        .select({ classroom: classrooms, villageName: villages?.name, teacherName: users.name })
        .from(classrooms)
        .leftJoin(villages, eq(villages.id, classrooms.villageId))
        .leftJoin(users, eq(users.id, classrooms.teacherId));

    if (villageId !== null) query.where(eq(classrooms.villageId, villageId));

    return await query;
};

const getVillageClassrooms = async (villageId: number): Promise<Classroom[]> => {
    return await db.select().from(classrooms).where(eq(classrooms.villageId, villageId));
};

const getCountryClassrooms = async (country: string): Promise<Classroom[]> => {
    return await db.select().from(classrooms).where(eq(classrooms.countryCode, country));
};

const getVillageCountryClassrooms = async (villageId: number, country: string): Promise<Classroom[]> => {
    return await db
        .select()
        .from(classrooms)
        .where(and(eq(classrooms.villageId, villageId), eq(classrooms.countryCode, country)));
};

const getClassroom = async (classroomId: number): Promise<Classroom[]> => {
    return await db.select().from(classrooms).where(eq(classrooms.id, classroomId));
};

const getAllClassrooms = async (): Promise<Classroom[]> => {
    return await db.select().from(classrooms).orderBy(classrooms.id);
};

const buildQuery = async (
    villageId: number | null,
    country: string | null,
    withVillage: boolean,
    classroomId: number | null,
): Promise<Classroom[] | ClassroomVillageTeacher[]> => {
    if (villageId && country) {
        return await getVillageCountryClassrooms(villageId, country);
    }
    if (withVillage) {
        return await getVillageClassroomsWithVillage(null);
    }
    if (villageId) {
        return await getVillageClassrooms(villageId);
    }
    if (country) {
        return await getCountryClassrooms(country);
    }
    if (classroomId) {
        return await getClassroom(classroomId);
    }
    return await getAllClassrooms();
};

export const GET = async ({ nextUrl }: NextRequest) => {
    const user = await getCurrentUser();

    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const { villageId, country, withVillage, classroomId } = loadSearchParams(nextUrl.searchParams);
    if (!villageId && user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const result = await buildQuery(villageId, country, withVillage, classroomId);
    return NextResponse.json(result);
};
