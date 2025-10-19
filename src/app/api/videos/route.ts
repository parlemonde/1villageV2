import { invokeTranscodeVideosLambda } from '@server/aws/lambda';
import { db } from '@server/database';
import { medias } from '@server/database/schemas/medias';
import { uploadFile } from '@server/files/file-upload';
import { getCurrentUser } from '@server/helpers/get-current-user';
import mime from 'mime-types';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import path from 'path';
import { v4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        const formData = await request.formData();
        const file: FormDataEntryValue | null = formData.get('file');
        const isPelicoVideo = formData.get('isPelicoVideo') === 'true';

        if (!currentUser) {
            return new NextResponse(null, {
                status: 401,
            });
        }

        if (isPelicoVideo && currentUser?.role !== 'admin' && currentUser?.role !== 'mediator') {
            return new NextResponse(null, {
                status: 403,
            });
        }

        if (!file || !(file instanceof File)) {
            return new NextResponse('No file found in request', {
                status: 400,
            });
        }

        // Video is over 500MB
        if (file.size > 500 * 1024 * 1024) {
            return new NextResponse('File size is too large', {
                status: 400,
            });
        }

        // Upload video to storage
        const uuid = v4();
        const extension = path.extname(file.name).substring(1);
        const userVideoId = isPelicoVideo ? 'pelico' : currentUser.id;
        const fileName = `media/videos/users/${userVideoId}/${uuid}/original.${extension}`;
        const contentType = mime.lookup(fileName) || undefined;
        await uploadFile(fileName, Buffer.from(await file.arrayBuffer()), contentType);

        const url = `media/videos/users/${userVideoId}/${uuid}/hls/master.m3u8`;

        // Insert media into database
        await db.insert(medias).values({
            id: uuid,
            userId: currentUser.id,
            type: 'video',
            url,
            isPelico: isPelicoVideo,
            metadata: {
                originalFilePath: fileName,
            },
        });

        await invokeTranscodeVideosLambda(fileName);

        return Response.json({ url: `/${url}` });
    } catch {
        return new NextResponse('Unknown error happened', {
            status: 500,
        });
    }
}
