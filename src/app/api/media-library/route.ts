import { db } from '@server/database/database';
import { activities } from '@server/database/schemas/activities';
import { ACTIVITY_TYPES_ENUM, type ActivityType } from '@server/database/schemas/activity-types';
import { classrooms } from '@server/database/schemas/classrooms';
import type { MediaType } from '@server/database/schemas/medias';
import { medias } from '@server/database/schemas/medias';
import { users } from '@server/database/schemas/users';
import { villages } from '@server/database/schemas/villages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq, inArray, desc, count, and } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsBoolean, parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs/server';

export interface MediaLibraryItem {
    activityType: ActivityType;
    classroomAlias?: string;
    mediaType: MediaType;
    mediaUrl: string;
    mediaId: string;
    villageCountries: string[];
    villageName: string;
    isPelico: boolean;
}

export interface MediaLibraryResponse {
    items: MediaLibraryItem[];
    totalItems: number;
}

const GetMediasParams = {
    page: parseAsInteger.withDefault(1),
    itemsPerPage: parseAsInteger.withDefault(12),
    activityType: parseAsStringEnum<ActivityType>(ACTIVITY_TYPES_ENUM),
    countryCode: parseAsString,
    villageId: parseAsInteger,
    classroomId: parseAsInteger,
    isPelico: parseAsBoolean,
};

const loadSearchParams = createLoader(GetMediasParams);

export const GET = async (request: NextRequest) => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return new NextResponse(null, {
            status: 401,
        });
    }

    const { page, itemsPerPage, activityType, countryCode, villageId, classroomId, isPelico } = loadSearchParams(request.nextUrl.searchParams);

    const [totalItems] = await db
        .select({
            count: count(medias.id),
        })
        .from(activities)
        .innerJoin(users, eq(activities.userId, users.id))
        .leftJoin(classrooms, eq(activities.classroomId, classrooms.id))
        .innerJoin(medias, eq(medias.userId, users.id))
        .innerJoin(villages, eq(activities.villageId, villages.id))
        .where(
            and(
                inArray(medias.type, ['image', 'video']),
                activityType ? eq(activities.type, activityType) : undefined,
                countryCode ? eq(classrooms.countryCode, countryCode) : undefined,
                villageId ? eq(activities.villageId, villageId) : undefined,
                classroomId ? eq(activities.classroomId, classroomId) : undefined,
                isPelico ? eq(medias.isPelico, isPelico) : undefined,
            ),
        );

    const result = await db
        .selectDistinct({
            activityType: activities.type,
            classroomAlias: classrooms.alias,
            mediaType: medias.type,
            mediaUrl: medias.url,
            mediaId: medias.id,
            createDate: medias.createDate,
            villageCountries: villages.countries,
            villageName: villages.name,
            isPelico: medias.isPelico,
        })
        .from(activities)
        .innerJoin(users, eq(activities.userId, users.id))
        .leftJoin(classrooms, eq(activities.classroomId, classrooms.id))
        .innerJoin(medias, eq(medias.userId, users.id))
        .innerJoin(villages, eq(activities.villageId, villages.id))
        .where(
            and(
                inArray(medias.type, ['image', 'video']),
                activityType ? eq(activities.type, activityType) : undefined,
                countryCode ? eq(classrooms.countryCode, countryCode) : undefined,
                villageId ? eq(activities.villageId, villageId) : undefined,
                classroomId ? eq(activities.classroomId, classroomId) : undefined,
                isPelico ? eq(medias.isPelico, isPelico) : undefined,
            ),
        )

        .orderBy(desc(medias.createDate))
        .limit(itemsPerPage)
        .offset((page - 1) * itemsPerPage);

    return NextResponse.json({
        items: result,
        totalItems: totalItems.count,
    });
};
