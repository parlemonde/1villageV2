import { db } from '@server/database';
import { userPreferences, type UserPreferences } from '@server/database/schemas/user-preferences';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsArrayOf, parseAsStringEnum } from 'nuqs/server';

const userPreferencesSearchParams = {
    keys: parseAsArrayOf(parseAsStringEnum<keyof UserPreferences>(['parentInvitationMessage', 'userId'])),
};

const loadSearchParams = createLoader(userPreferencesSearchParams);

export const GET = async ({ nextUrl }: NextRequest): Promise<NextResponse<Partial<UserPreferences>>> => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const { keys } = loadSearchParams(nextUrl.searchParams);

    if (!keys) {
        return new NextResponse(null, { status: 400 });
    }

    const columns = Object.fromEntries(keys.map((key) => [key, userPreferences[key]]));

    const [preferences] = await db.select(columns).from(userPreferences).where(eq(userPreferences.userId, user.id)).limit(1);
    if (!preferences) {
        return new NextResponse(null, { status: 404 });
    }
    return NextResponse.json(preferences);
};
