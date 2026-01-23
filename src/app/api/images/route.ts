import { db } from '@server/database';
import { medias } from '@server/database/schemas/medias';
import { uploadFile } from '@server/files/file-upload';
import { getCurrentUser } from '@server/helpers/get-current-user';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { v4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const [currentUser, formData] = await Promise.all([getCurrentUser(), request.formData()]);

        const file: FormDataEntryValue | null = formData.get('image');
        const isPelicoImage = formData.get('isPelicoImage') === 'true';
        const activityId = formData.get('activityId');

        if (!currentUser) {
            return new NextResponse(null, {
                status: 401,
            });
        }

        if (isPelicoImage && currentUser?.role !== 'admin' && currentUser?.role !== 'mediator') {
            return new NextResponse(null, {
                status: 403,
            });
        }

        if (!file || !(file instanceof File)) {
            return new NextResponse('No file found in request', {
                status: 400,
            });
        }

        // Image is over 4MB
        if (file.size > 4 * 1024 * 1024) {
            return new NextResponse('File size is too large', {
                status: 400,
            });
        }

        const uuid = v4();
        const fileBuffer = await file.arrayBuffer();

        // - Resize image if needed to max width: 3840. (4k resolution)
        // - Use `.rotate()` to keep original image orientation metadata.
        const sharpPipeline = sharp(fileBuffer)
            .rotate()
            .resize(3840, null, {
                withoutEnlargement: true,
            })
            .toFormat('webp');

        const [imageBuffer, imageSize] = await Promise.all([sharpPipeline.toBuffer(), sharpPipeline.metadata()]);

        // Upload image to storage
        const userImageId = isPelicoImage ? 'pelico' : currentUser.id;
        const fileName = `media/images/users/${userImageId}/${uuid}.webp`;

        await Promise.all([
            uploadFile(fileName, imageBuffer, 'image/webp'),
            db.insert(medias).values({
                id: uuid,
                userId: currentUser.id,
                type: 'image',
                url: fileName,
                isPelico: isPelicoImage,
                metadata: {
                    width: imageSize.width,
                    height: imageSize.height,
                },
                activityId: activityId ? Number(activityId) : null,
            }),
        ]);

        return Response.json({ url: `/${fileName}`, id: uuid });
    } catch {
        return new NextResponse('Unknown error happened', {
            status: 500,
        });
    }
}
