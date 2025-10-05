import { db } from '@server/database';
import { medias } from '@server/database/schemas/medias';
import { getErrorResponse } from '@server/h5p/get-error-response';
import { getH5pEditors } from '@server/h5p/get-h5p-editor';
import { getH5pUser } from '@server/h5p/get-h5p-user';
import { getJsonBody } from '@server/h5p/get-json-body';
import { eq } from 'drizzle-orm';
import { NextResponse, type NextRequest } from 'next/server';

export const PATCH = async (request: NextRequest, { params }: { params: Promise<{ contentId: string }> }) => {
    const user = await getH5pUser();
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }
    if (user.type !== 'admin') {
        return new Response('Unauthorized', { status: 403 });
    }

    const { contentId } = await params;
    const body = await getJsonBody(request);
    const { h5pEditor } = await getH5pEditors();
    if (!h5pEditor) {
        return new Response('H5P not initialized', { status: 500 });
    }

    try {
        const { id: updatedContentId, metadata } = await h5pEditor.saveOrUpdateContentReturnMetaData(
            contentId,
            body.params.params,
            body.params.metadata,
            body.library,
            user,
        );
        return NextResponse.json({
            contentId: updatedContentId,
            metadata,
        });
    } catch (error) {
        return getErrorResponse(error);
    }
};

export const DELETE = async (_request: NextRequest, { params }: { params: Promise<{ contentId: string }> }) => {
    const user = await getH5pUser();
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }
    if (user.type !== 'admin') {
        return new Response('Unauthorized', { status: 403 });
    }

    const { contentId } = await params;
    const { h5pEditor } = await getH5pEditors();
    if (!h5pEditor) {
        return new Response('H5P not initialized', { status: 500 });
    }

    try {
        await h5pEditor.contentManager.deleteContent(contentId, user);
        await db.delete(medias).where(eq(medias.id, contentId));
        return NextResponse.json({ success: true });
    } catch (error) {
        return getErrorResponse(error);
    }
};
