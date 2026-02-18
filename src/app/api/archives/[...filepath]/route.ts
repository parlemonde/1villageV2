import { getFile, getFileData, listFolders } from '@server/files/file-upload';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getSingleBytesRange } from '@server/lib/get-single-bytes-range';
import mime from 'mime-types';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import sanitize from 'sanitize-filename';
import { Readable } from 'stream';

const notFoundResponse = () => {
    return new NextResponse(null, {
        status: 404,
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
    });
};
const getContentTypeFromFileName = (filename: string): string | null => mime.lookup(filename) || null;

export async function GET(request: NextRequest, props: { params: Promise<{ filepath: string[] }> }) {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, {
            status: 401,
        });
    }

    const filePath = (await props.params).filepath;
    if (filePath.length === 1) {
        filePath.push('index.html');
    }
    let fileName = `archives/${filePath.map((path) => sanitize(path)).join('/')}`;
    if (fileName.indexOf('.') === -1) {
        fileName += '.html';
    }

    const data = await getFileData(fileName);
    if (!data || data.ContentLength === 0) {
        return notFoundResponse();
    }

    const contentType = data.ContentType || getContentTypeFromFileName(fileName) || 'application/octet-stream';
    const range = request.headers.get('range') || undefined;
    const singleBytesRange = getSingleBytesRange(data.ContentLength, range);

    if (range !== undefined && singleBytesRange === null) {
        return new Response(null, {
            status: 416,
            headers: {
                'Content-Range': `bytes */${data.ContentLength}`,
            },
        });
    }

    const readable = (await getFile(fileName, range))?.on('error', () => {
        return notFoundResponse();
    });
    if (!readable) {
        return notFoundResponse();
    }

    const status = singleBytesRange ? 206 : 200;
    const headers: Record<string, string> = {
        'Last-Modified': data.LastModified.toISOString(),
        'Content-Type': contentType,
        'Cache-Control': 'public, s-maxage=604800, max-age=2678400, immutable',
        'Accept-Ranges': 'bytes',
    };
    if (singleBytesRange) {
        headers['Content-Range'] = `bytes ${singleBytesRange.start}-${singleBytesRange.end}/${data.ContentLength}`;
        headers['Content-Length'] = `${singleBytesRange.end - singleBytesRange.start + 1}`;
    } else {
        headers['Content-Length'] = `${data.ContentLength}`;
    }
    return new Response(Readable.toWeb(readable) as ReadableStream, {
        status,
        headers,
    });
}

/**
 * Liste les sous-dossiers de 1er niveau dans /tmp/archives/
 * @returns Un tableau des noms de sous-dossiers
 */
export async function getArchiveFolders(): Promise<string[]> {
    try {
        return await listFolders('archives');
    } catch (error) {
        console.error('Erreur lors de la lecture des dossiers archives:', error);
        return [];
    }
}
