import { getS3File } from '@server/aws/s3';
import { db } from '@server/database/database';
import { activities } from '@server/database/schemas/activities';
import { ACTIVITY_TYPES_ENUM, type ActivityType } from '@server/database/schemas/activity-types';
import { classrooms } from '@server/database/schemas/classrooms';
import { medias } from '@server/database/schemas/medias';
import { users } from '@server/database/schemas/users';
import { villages } from '@server/database/schemas/villages';
import { getLocalFile } from '@server/files/local';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getEnvVariable } from '@server/lib/get-env-variable';
import { eq, inArray, desc, and } from 'drizzle-orm';
import JSZip from 'jszip';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsBoolean, parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs/server';

const USE_S3 = getEnvVariable('S3_BUCKET_NAME') !== '';

const GetMediaArchiveParams = {
    page: parseAsInteger.withDefault(1),
    itemsPerPage: parseAsInteger.withDefault(12),
    activityType: parseAsStringEnum<ActivityType>(ACTIVITY_TYPES_ENUM),
    countryCode: parseAsString,
    villageId: parseAsInteger,
    classroomId: parseAsInteger,
    isPelico: parseAsBoolean,
};

const loadSearchParams = createLoader(GetMediaArchiveParams);

export const GET = async (request: NextRequest) => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return new NextResponse(null, {
            status: 401,
        });
    }

    const { page, itemsPerPage, activityType, countryCode, villageId, classroomId, isPelico } = loadSearchParams(request.nextUrl.searchParams);

    const mediasList = await db
        .selectDistinct({
            activityId: activities.id,
            activityType: activities.type,
            villageName: villages.name,
            type: medias.type,
            url: medias.url,
            metadata: medias.metadata,
            createDate: medias.createDate,
        })
        .from(activities)
        .innerJoin(users, eq(activities.userId, users.id))
        .innerJoin(medias, eq(medias.activityId, activities.id))
        .innerJoin(villages, eq(activities.villageId, villages.id))
        .leftJoin(classrooms, eq(activities.classroomId, classrooms.id))
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

    if (mediasList.length === 0) {
        return new NextResponse(null, {
            status: 404,
        });
    }

    const zip = new JSZip();

    const filePromises = mediasList.map(async (media) => {
        const url = media.metadata && 'originalFilePath' in media.metadata ? media.metadata.originalFilePath : media.url;
        const file = USE_S3 ? await getS3File(url) : await getLocalFile(url);
        if (!file) {
            console.error(`File not found: ${url}`);
            return null;
        }

        const fileExtension = url.split('.').pop();
        const fileName = `${media.activityType}_${media.villageName.replace(/ /g, '_')}_${media.activityId}.${fileExtension}`;
        return { fileName, file };
    });

    const files = await Promise.all(filePromises);

    for (const fileData of files) {
        if (fileData) {
            zip.file(fileData.fileName, fileData.file);
        }
    }

    const zipBuffer = await zip.generateAsync({ type: 'uint8array' });
    const blob = new Uint8Array(zipBuffer);

    const archiveName = `mediatheque_${new Date().toLocaleDateString()}.zip`;
    return new NextResponse(blob, {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Length': zipBuffer.byteLength.toString(),
            'Content-Disposition': `attachment; filename="${archiveName}"`,
        },
        statusText: 'OK',
    });
};
