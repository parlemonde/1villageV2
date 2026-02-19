import { db } from '@server/database';
import { students } from '@server/database/schemas/students';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getCurrentVillageAndClassroomForUser } from '@server/helpers/get-current-village-and-classroom';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const GET = async () => {
    const user = await getCurrentUser();
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { classroom } = await getCurrentVillageAndClassroomForUser(user);
    if (!classroom) {
        return new Response('Bad Request', { status: 400 });
    }

    const result = await db
        .select()
        .from(students)
        .where(and(eq(students.teacherId, user.id), eq(students.classroomId, classroom.id)));

    return NextResponse.json(result);
};
