import { db } from '@server/database/database';
import { activities } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
import { classrooms } from '@server/database/schemas/classrooms';
import { medias } from '@server/database/schemas/medias';
import type { UserRole } from '@server/database/schemas/users';
import { users } from '@server/database/schemas/users';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq, inArray, desc, count } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsArrayOf, parseAsInteger, parseAsStringEnum } from 'nuqs/server';

export type MediaType = 'image' | 'audio' | 'video' | 'h5p' | 'pdf';
const mediaTypes: MediaType[] = ['image', 'audio', 'video', 'h5p', 'pdf'];

export interface MediaLibraryItem {
    activityType: ActivityType;
    schoolName?: string;
    mediaType: MediaType;
    mediaUrl: string;
    mediaId: string;
    villageCountries: string[];
    villageName: string;
    userRole: UserRole;
}

export interface MediaLibraryResponse {
    items: MediaLibraryItem[];
    totalItems: number;
}

const GetMediasParams = {
    types: parseAsArrayOf(parseAsStringEnum(mediaTypes)),
    page: parseAsInteger.withDefault(1),
    itemsPerPage: parseAsInteger.withDefault(12),
};
const loadSearchParams = createLoader(GetMediasParams);
export const GET = async (request: NextRequest) => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return new NextResponse(null, {
            status: 401,
        });
    }

    const { page, itemsPerPage, types } = loadSearchParams(request.nextUrl.searchParams);

    const [totalItems] = await db
        .select({
            count: count(medias.id),
        })
        .from(medias)
        .where(inArray(medias.type, types as typeof mediaTypes));

    const result = await db
        .selectDistinct({
            activityType: activities.type,
            schoolName: classrooms.name,
            mediaType: medias.type,
            mediaUrl: medias.url,
            mediaId: medias.id,
            createDate: medias.createDate,
            villageCountries: villages.countries,
            villageName: villages.name,
            userRole: users.role,
        })
        .from(activities)
        .innerJoin(users, eq(activities.userId, users.id))
        .leftJoin(classrooms, eq(activities.classroomId, classrooms.id))
        .innerJoin(medias, eq(medias.userId, users.id))
        .innerJoin(villages, eq(activities.villageId, villages.id))
        .where(inArray(medias.type, types as typeof mediaTypes))
        .orderBy(desc(medias.createDate))
        .limit(itemsPerPage)
        .offset((page - 1) * itemsPerPage);

    return NextResponse.json({
        items: result,
        totalItems: totalItems.count,
    });
};
