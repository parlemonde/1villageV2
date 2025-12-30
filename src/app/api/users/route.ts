import { db } from '@server/database';
import { activities } from '@server/database/schemas/activities';
import { classrooms } from '@server/database/schemas/classrooms';
import { users } from '@server/database/schemas/users';
import type { User } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq, and, isNull } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server';

const usersSearchParams = {
    villageId: parseAsInteger,
    role: parseAsString,
    teacherId: parseAsString,
};
const loadSearchParams = createLoader(usersSearchParams);

const userColumns = {
    id: users.id,
    email: users.email,
    name: users.name,
    // useSSO: sql<boolean>`case when "accountRegistration" >= 10 then true else false end`,
    role: users.role,
    image: users.image,
};

const getVillageUsers = async (villageId: number): Promise<User[]> => {
    const classroomsUsers = await db
        .select({
            user: userColumns,
        })
        .from(users)
        .innerJoin(classrooms, eq(users.id, classrooms.teacherId))
        .where(eq(classrooms.villageId, villageId));
    const activitiesUsers = await db
        .select({
            user: userColumns,
        })
        .from(users)
        .innerJoin(activities, eq(users.id, activities.userId))
        .where(and(eq(activities.villageId, villageId), isNull(activities.classroomId)));

    // Merge the two arrays and deduplicate
    const allUsers = [...classroomsUsers, ...activitiesUsers].map(({ user }) => user);
    const ids = new Set<string>();
    return allUsers.filter(({ id }) => {
        if (ids.has(id)) {
            return false;
        }
        ids.add(id);
        return true;
    });
};

const getAllUsers = async (): Promise<User[]> => {
    return (await db.select(userColumns).from(users).orderBy(users.id)) as User[];
};

const getAllTeachers = async (): Promise<User[]> => {
    return await db.select(userColumns).from(users).where(eq(users.role, 'teacher'));
};

export const GET = async ({ nextUrl }: NextRequest) => {
    const user = await getCurrentUser();
    if (!user) {
        // Unauthenticated
        return new NextResponse(null, { status: 401 });
    }

    const { villageId, role } = loadSearchParams(nextUrl.searchParams);

    if (villageId !== null) {
        return NextResponse.json(await getVillageUsers(villageId));
    } else {
        if (user.role !== 'admin') {
            return new NextResponse(null, { status: 403 });
        }

        if (role === 'teacher') {
            return NextResponse.json(await getAllTeachers());
        }

        return NextResponse.json(await getAllUsers());
    }
};
