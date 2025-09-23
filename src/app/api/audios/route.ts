import { db } from '@server/database';
import { medias } from '@server/database/schemas/medias';
import { uploadFile } from '@server/files/file-upload';
import { getCurrentUser } from '@server/helpers/get-current-user';
import mime from 'mime-types';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import path from 'path';
import { v4 } from 'uuid';

const getDuration = (value: FormDataEntryValue | null) => {
    if (typeof value !== 'string') {
        return 0;
    }
    const n = Number(value);
    if (!Number.isNaN(n) && Number.isFinite(n)) {
        return n;
    }
    return 0;
};

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        const formData = await request.formData();
        const file: FormDataEntryValue | null = formData.get('file');
        const isPelicoAudio = formData.get('isPelicoAudio') === 'true';
        const duration = getDuration(formData.get('duration'));

        if (!currentUser) {
            return new NextResponse(null, {
                status: 401,
            });
        }

        if (isPelicoAudio && currentUser?.role !== 'admin' && currentUser?.role !== 'mediator') {
            return new NextResponse(null, {
                status: 403,
            });
        }

        if (!file || !(file instanceof File)) {
            return new NextResponse('No file found in request', {
                status: 400,
            });
        }

        // Audio is over 50MB
        if (file.size > 50 * 1024 * 1024) {
            return new NextResponse('File size is too large', {
                status: 400,
            });
        }

        // Upload audio to storage
        const uuid = v4();
        const extension = path.extname(file.name).substring(1);
        const userAudioId = isPelicoAudio ? 'pelico' : currentUser.id;
        const fileName = `media/audios/users/${userAudioId}/${uuid}.${extension}`;
        const contentType = mime.lookup(fileName) || undefined;
        await uploadFile(fileName, Buffer.from(await file.arrayBuffer()), contentType);

        // Insert media into database
        await db.insert(medias).values({
            id: uuid,
            userId: currentUser.id,
            type: 'audio',
            url: fileName,
            isPelico: isPelicoAudio,
            metadata: {
                duration,
            },
        });

        return Response.json({ url: `/${fileName}` });
    } catch {
        return new NextResponse('Unknown error happened', {
            status: 500,
        });
    }
}
