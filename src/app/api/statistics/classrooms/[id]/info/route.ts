import { db } from '@server/database';
// eslint-disable-next-line camelcase
import { auth_sessions } from '@server/database/schemas/auth-schemas';
import { classrooms } from '@server/database/schemas/classrooms';
import { users } from '@server/database/schemas/users';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export interface ClassroomInfo {
    alias?: string;
    address: string;
    level?: string;
    name: string;
    countryCode: string;
    coordinates?: { lat: number; lng: number };
    villageName: string;
    email: string;
    lastSeen?: Date;
    teacherName: string;
}

export const GET = async (_req: Request, { params }: { params: Promise<{ id: number }> }): Promise<NextResponse<ClassroomInfo>> => {
    const user = await getCurrentUser();

    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    if (user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const { id } = await params;

    const result = await db
        .select({
            alias: classrooms.alias,
            level: classrooms.level,
            name: classrooms.name,
            address: classrooms.address,
            countryCode: classrooms.countryCode,
            coordinates: classrooms.coordinates,
            villageName: villages.name,
            email: users.email,
            // eslint-disable-next-line camelcase
            lastSeen: auth_sessions.updatedAt,
            teacherName: users.name,
        })
        .from(classrooms)
        .innerJoin(villages, eq(classrooms.villageId, villages.id))
        .innerJoin(users, eq(users.id, classrooms.teacherId))
        // eslint-disable-next-line camelcase
        .leftJoin(auth_sessions, eq(users.id, auth_sessions.userId))
        .where(eq(classrooms.id, id))
        // eslint-disable-next-line camelcase
        .orderBy(desc(auth_sessions.updatedAt))
        .limit(1);

    if (!result) {
        return new NextResponse(null, { status: 404 });
    }

    const classroom: ClassroomInfo = {
        ...result[0],
        alias: result[0]?.alias ?? undefined,
        level: result[0]?.level ?? undefined,
        lastSeen: result[0]?.lastSeen ?? undefined,
        coordinates: result[0]?.coordinates ? { lat: result[0].coordinates.latitude, lng: result[0].coordinates.longitude } : undefined,
    };

    return NextResponse.json(classroom);
};
