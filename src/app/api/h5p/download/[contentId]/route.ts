import { getErrorResponse } from '@server/h5p/get-error-response';
import { getH5pEditors } from '@server/h5p/get-h5p-editor';
import { getH5pUser } from '@server/h5p/get-h5p-user';
import type { NextRequest } from 'next/server';
import { PassThrough, Readable } from 'stream';

export const GET = async (_request: NextRequest, { params }: { params: Promise<{ contentId: string }> }) => {
    const user = await getH5pUser();
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { contentId } = await params;
    const { h5pEditorAjax } = await getH5pEditors();
    if (!h5pEditorAjax) {
        return new Response('H5P not initialized', { status: 500 });
    }

    try {
        // Create a PassThrough stream to bridge between Node.js and Web streams
        const passThrough = new PassThrough();

        // Start the download process (this writes to the PassThrough stream)
        const downloadPromise = h5pEditorAjax.getDownload(contentId, user, passThrough);

        // Convert the Node.js Readable stream to a Web ReadableStream
        const webStream = Readable.toWeb(passThrough) as ReadableStream;

        // Start the download process in the background
        downloadPromise.catch((error) => {
            passThrough.destroy(error);
        });

        return new Response(webStream, {
            headers: {
                'Content-Disposition': `attachment; filename="${contentId}.h5p"`,
            },
        });
    } catch (error) {
        return getErrorResponse(error);
    }
};
