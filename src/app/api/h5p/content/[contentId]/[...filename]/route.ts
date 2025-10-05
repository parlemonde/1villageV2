import { getErrorResponse } from '@server/h5p/get-error-response';
import { getH5pEditors } from '@server/h5p/get-h5p-editor';
import { getH5pUser } from '@server/h5p/get-h5p-user';
import { getRange } from '@server/h5p/get-range';
import type { NextRequest } from 'next/server';
import { Readable } from 'stream';

export const GET = async (request: NextRequest, { params }: { params: Promise<{ contentId: string; filename: string[] }> }) => {
    const user = await getH5pUser();
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { h5pEditorAjax } = await getH5pEditors();
    if (!h5pEditorAjax) {
        return new Response('H5P not initialized', { status: 500 });
    }

    try {
        const { contentId, filename } = await params;
        const rangeHeader = request.headers.get('range');
        const response = await h5pEditorAjax.getContentFile(
            contentId,
            filename.join('/'),
            user,
            rangeHeader ? (fileSize) => getRange(fileSize, rangeHeader) : undefined,
        );
        const headers = new Headers({
            'Content-Type': response.mimetype,
        });
        if (response.range) {
            headers.set('Content-Range', `bytes ${response.range.start}-${response.range.end}/${response.stats.size}`);
            headers.set('Content-Length', `${response.range.end - response.range.start + 1}`);
        } else {
            headers.set('Accept-Ranges', 'bytes');
            headers.set('Content-Length', response.stats.size.toString());
        }
        return new Response(Readable.toWeb(response.stream) as ReadableStream, {
            status: response.range ? 206 : 200,
            headers,
        });
    } catch (error) {
        return getErrorResponse(error);
    }
};
