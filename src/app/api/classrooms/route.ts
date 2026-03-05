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
    teacherId: parseAsString,
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

const getVillageClassroomsWithVillage = async (): Promise<ClassroomVillageTeacher[]> => {
    return await db
        .select({ classroom: classrooms, villageName: villages?.name, teacherName: users.name })
        .from(classrooms)
        .leftJoin(villages, eq(villages.id, classrooms.villageId))
        .leftJoin(users, eq(users.id, classrooms.teacherId));
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

const getTeacherClassrooms = async (teacherId: string): Promise<Classroom[]> => {
    return await db.select().from(classrooms).where(eq(classrooms.teacherId, teacherId));
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
    teacherId: string | null,
): Promise<Classroom[] | ClassroomVillageTeacher[]> => {
    if (villageId && country) {
        return await getVillageCountryClassrooms(villageId, country);
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
    if (teacherId) {
        return await getTeacherClassrooms(teacherId);
    }
    return await getAllClassrooms();
};

export const GET = async ({ nextUrl }: NextRequest) => {
    const user = await getCurrentUser();
    let result;

    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const { villageId, country, withVillage, classroomId, teacherId } = loadSearchParams(nextUrl.searchParams);
    if (!villageId && user.role !== 'admin') {
        // return new NextResponse(null, { status: 403 });
    }

    if (withVillage) {
        result = await getVillageClassroomsWithVillage();
    } else {
        result = await buildQuery(villageId, country, classroomId);
    }
    return NextResponse.json(result);
};
