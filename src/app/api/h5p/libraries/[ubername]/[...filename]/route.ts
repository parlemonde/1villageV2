import { getErrorResponse } from '@server/h5p/get-error-response';
import { getH5pEditors } from '@server/h5p/get-h5p-editor';
import { getH5pUser } from '@server/h5p/get-h5p-user';
import type { NextRequest } from 'next/server';
import { Readable } from 'stream';

export const GET = async (_request: NextRequest, { params }: { params: Promise<{ ubername: string; filename: string[] }> }) => {
    const h5pUser = await getH5pUser();
    if (!h5pUser) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { ubername, filename } = await params;
    const { h5pEditorAjax } = await getH5pEditors();
    if (!h5pEditorAjax) {
        return new Response('H5P not initialized', { status: 500 });
    }

    try {
        const response = await h5pEditorAjax.getLibraryFile(ubername, filename.join('/'));
        return new Response(Readable.toWeb(response.stream) as ReadableStream, {
            headers: {
                'Content-Type': response.mimetype,
                'Content-Length': response.stats.size.toString(),
            },
        });
    } catch (error) {
        return getErrorResponse(error);
    }
};
