import { db } from '@server/database/database';
import { medias } from '@server/database/schemas/medias';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { and, eq, or } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsBoolean, parseAsStringEnum } from 'nuqs/server';

const GetMediasParams = {
    type: parseAsStringEnum(['image', 'audio', 'video', 'h5p', 'pdf']),
    isPelico: parseAsBoolean.withDefault(false),
};
const loadSearchParams = createLoader(GetMediasParams);
export const GET = async (request: NextRequest) => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return new NextResponse(null, {
            status: 401,
        });
    }

    const { type, isPelico } = loadSearchParams(request.nextUrl.searchParams);
    const isPelicoMedia = isPelico && (currentUser.role === 'admin' || currentUser.role === 'mediator');

    const result = await db
        .select()
        .from(medias)
        .where(and(or(eq(medias.userId, currentUser.id), eq(medias.isPelico, isPelicoMedia)), type !== null ? eq(medias.type, type) : undefined));

    return NextResponse.json(result);
};
