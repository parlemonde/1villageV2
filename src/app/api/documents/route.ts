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
        const [currentUser, formData] = await Promise.all([getCurrentUser(), request.formData()]);

        const file: FormDataEntryValue | null = formData.get('file');
        const isPelicoDocument = formData.get('isPelicoDocument') === 'true';
        const activityId = formData.get('activityId');

        if (!currentUser) {
            return new NextResponse(null, {
                status: 401,
            });
        }

        if (isPelicoDocument && currentUser?.role !== 'admin' && currentUser?.role !== 'mediator') {
            return new NextResponse(null, {
                status: 403,
            });
        }

        if (!file || !(file instanceof File)) {
            return new NextResponse('No file found in request', {
                status: 400,
            });
        }

        // Document is over 50MB
        if (file.size > 50 * 1024 * 1024) {
            return new NextResponse('File size is too large', {
                status: 400,
            });
        }

        // Upload document to storage
        const uuid = v4();
        const extension = path.extname(file.name).substring(1);
        if (extension !== 'pdf') {
            return new NextResponse('Unsupported file type', {
                status: 400,
            });
        }
        const userDocumentId = isPelicoDocument ? 'pelico' : currentUser.id;
        const fileName = `media/documents/users/${userDocumentId}/${uuid}.${extension}`;
        const contentType = mime.lookup(fileName) || undefined;
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        await Promise.all([
            uploadFile(fileName, fileBuffer, contentType),
            db.insert(medias).values({
                id: uuid,
                userId: currentUser.id,
                type: 'pdf',
                url: fileName,
                isPelico: isPelicoDocument,
                activityId: activityId ? Number(activityId) : null,
            }),
        ]);

        return Response.json({ url: `/${fileName}` });
    } catch {
        return new NextResponse('Unknown error happened', {
            status: 500,
        });
    }
}
