import { getFile, getFileData } from '@server/files/file-upload';
import { getCurrentUser } from '@server/helpers/get-current-user';
import mime from 'mime-types';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import sanitize from 'sanitize-filename';
import { Readable } from 'stream';

const notFoundResponse = () => {
    return new NextResponse(null, {
        status: 404,
    });
};
const getContentTypeFromFileName = (filename: string): string | null => mime.lookup(filename) || null;

export async function GET(_request: NextRequest, props: { params: Promise<{ filepath: string[] }> }) {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, {
            status: 401,
        });
    }

    const filePath = (await props.params).filepath;
    const fileName = `media/${filePath.map((path) => sanitize(path)).join('/')}`;
    const data = await getFileData(fileName);
    if (!data || data.ContentLength === 0) {
        return notFoundResponse();
    }

    const contentType = data.ContentType || getContentTypeFromFileName(fileName) || 'application/octet-stream';
    const readable = (await getFile(fileName))?.on('error', () => {
        return notFoundResponse();
    });
    if (!readable) {
        return notFoundResponse();
    }

    return new Response(Readable.toWeb(readable) as ReadableStream, {
        status: 200,
        headers: {
            'Last-Modified': data.LastModified.toISOString(),
            'Content-Type': contentType,
            'Content-Length': `${data.ContentLength}`,
            'Cache-Control': 'public, s-maxage=604800, max-age=2678400, immutable',
            'Accept-Ranges': 'none',
        },
    });
}

export async function HEAD(_request: NextRequest, props: { params: Promise<{ filepath: string[] }> }) {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, {
            status: 401,
        });
    }

    const filePath = (await props.params).filepath;
    const fileName = filePath.map((path) => sanitize(path)).join('/');
    const data = await getFileData(fileName);
    if (!data || data.ContentLength === 0) {
        return notFoundResponse();
    }

    const contentType = data.ContentType || getContentTypeFromFileName(fileName) || 'application/octet-stream';

    return new Response(null, {
        status: 200,
        headers: {
            'Last-Modified': data.LastModified.toISOString(),
            'Content-Type': contentType,
            'Content-Length': `${data.ContentLength}`,
            'Cache-Control': 'public, s-maxage=604800, max-age=2678400, immutable',
            'Accept-Ranges': 'none',
        },
    });
}
