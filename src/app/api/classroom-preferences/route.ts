import { db } from '@server/database';
import { classroomPreferences, type ClassroomPreferences } from '@server/database/schemas/classroom-preferences';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsArrayOf, parseAsStringEnum } from 'nuqs/server';

const classroomPreferencesSearchParams = {
    keys: parseAsArrayOf(parseAsStringEnum<keyof Omit<ClassroomPreferences, 'userId' | 'classroomId'>>(['parentInvitationMessage'])),
};

const loadSearchParams = createLoader(classroomPreferencesSearchParams);

export const GET = async ({ nextUrl }: NextRequest): Promise<NextResponse<Partial<ClassroomPreferences>>> => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const { keys } = loadSearchParams(nextUrl.searchParams);

    if (!keys) {
        return new NextResponse(null, { status: 400 });
    }

    const columns = Object.fromEntries(keys.map((key) => [key, classroomPreferences[key]]));

    const [preferences] = await db.select(columns).from(classroomPreferences).where(eq(classroomPreferences.userId, user.id)).limit(1);
    if (!preferences) {
        return new NextResponse(null, { status: 404 });
    }
    return NextResponse.json(preferences);
};
