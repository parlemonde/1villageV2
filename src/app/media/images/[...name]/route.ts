import { getFile, getFileData } from '@server/files/file-upload';
import { getCurrentUser } from '@server/helpers/get-current-user';
import mime from 'mime-types';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsInteger } from 'nuqs/server';
import sanitize from 'sanitize-filename';
import sharp from 'sharp';
import { Readable } from 'stream';

const notFoundResponse = () => {
    return new NextResponse('Error 404, not found.', {
        status: 404,
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
    });
};
const getContentTypeFromFileName = (filename: string): string | null => mime.lookup(filename) || null;

const ImageFormatParams = {
    w: parseAsInteger,
    q: parseAsInteger.withDefault(75),
};
const loadImageFormatParams = createLoader(ImageFormatParams);

export async function GET(request: NextRequest, props: { params: Promise<{ name: string[] }> }) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return new NextResponse(null, {
            status: 401,
        });
    }

    const params = await props.params;
    const fileName = `media/images/${params.name.map((path) => sanitize(path)).join('/')}`;
    const data = await getFileData(fileName);

    if (!data || data.ContentLength === 0) {
        return notFoundResponse();
    }

    const size = data.ContentLength;
    const range = request.headers.get('range');
    const contentType =
        data.ContentType.length === 0 || data.ContentType === 'application/octet-stream'
            ? (getContentTypeFromFileName(fileName) ?? 'application/octet-stream')
            : (data.ContentType ?? 'application/octet-stream');
    const { w: width, q: quality } = loadImageFormatParams(request.nextUrl.searchParams);

    const readable = (await getFile(fileName, range || undefined))?.on('error', () => {
        return notFoundResponse();
    });
    if (!readable) {
        return notFoundResponse();
    }
    const headers = new Headers({
        'Last-Modified': data.LastModified.toISOString(),
        'Content-Type': contentType,
        'Cache-Control': 'public, s-maxage=604800, max-age=2678400, immutable',
    });

    /** Check for Range header */
    if (range) {
        /** Extracting Start and End value from Range Header */
        const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
        let start = parseInt(startStr, 10);
        let end = endStr ? parseInt(endStr, 10) : size - 1;

        if (!isNaN(start) && isNaN(end)) {
            end = size - 1;
        }
        if (isNaN(start) && !isNaN(end)) {
            start = size - end;
            end = size - 1;
        }

        // Handle unavailable range request
        if (start >= size || end >= size) {
            // Return the 416 Range Not Satisfiable.
            const response = new Response(null, {
                status: 416,
                headers,
            });
            response.headers.set('Content-Range', `bytes */${size}`);
            return response;
        }

        /** Sending Partial Content With HTTP Code 206 */
        const response = new Response(Readable.toWeb(readable) as ReadableStream, {
            status: 206,
            headers,
        });
        response.headers.set('Accept-Ranges', 'bytes');
        response.headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
        response.headers.set('Content-Length', `${end - start + 1}`);
        return response;
    } else if (width) {
        const resizedImage = await getResizedImageBuffer(readable, width, Math.max(Math.min(quality, 100), 1), contentType.slice(6));
        const response = new Response(resizedImage as unknown as BodyInit, {
            status: 200,
            headers,
        });
        response.headers.set('Content-Length', `${resizedImage.byteLength}`);
        return response;
    } else {
        const response = new Response(Readable.toWeb(readable) as ReadableStream, {
            status: 200,
            headers,
        });
        response.headers.set('Content-Length', `${data.ContentLength}`);
        return response;
    }
}

export async function HEAD(request: NextRequest, props: { params: Promise<{ name: string[] }> }) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return new NextResponse(null, {
            status: 401,
        });
    }

    const params = await props.params;
    const fileName = `images/${params.name.map((path) => sanitize(path)).join('/')}`;
    const data = await getFileData(fileName);
    if (!data || data.ContentLength === 0) {
        return notFoundResponse();
    }

    const contentType =
        data.ContentType.length === 0 || data.ContentType === 'application/octet-stream'
            ? (getContentTypeFromFileName(fileName) ?? 'application/octet-stream')
            : (data.ContentType ?? 'application/octet-stream');
    const { w: width, q: quality } = loadImageFormatParams(request.nextUrl.searchParams);

    const response = new NextResponse(null, {
        status: 200,
    });
    if (width) {
        const readable = (await getFile(fileName))?.on('error', () => {
            return notFoundResponse();
        });
        if (!readable) {
            return notFoundResponse();
        }
        const resizedImage = await getResizedImageBuffer(readable, width, Math.max(Math.min(quality, 100), 1), contentType.slice(6));
        // if width, response will be resized image, so no range support
        response.headers.set('Content-Length', `${resizedImage.byteLength}`);
    } else {
        response.headers.set('Accept-Ranges', 'bytes');
        response.headers.set('Content-Length', `${data.ContentLength}`);
    }
    response.headers.set('Last-Modified', data.LastModified.toISOString());
    response.headers.set('Content-Type', contentType);
    return response;
}

async function getResizedImageBuffer(image: Readable, width: number, quality?: number, format?: string): Promise<Buffer> {
    const pipeline = sharp();
    pipeline.resize(width);
    if (quality && (format === 'jpeg' || format === 'jpg')) {
        pipeline.jpeg({ quality: Math.max(Math.min(quality, 100), 1) });
    } else if (quality && format === 'webp') {
        pipeline.webp({ quality: Math.max(Math.min(quality, 100), 1) });
    } else if (quality && format === 'avif') {
        pipeline.avif({ quality: Math.max(Math.min(quality, 100), 1) });
    } else if (quality && format === 'png') {
        pipeline.png({ quality: Math.max(Math.min(quality, 100), 1) });
    }
    image.pipe(pipeline);
    return pipeline.toBuffer();
}
