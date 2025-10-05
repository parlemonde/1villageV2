import { db } from '@server/database';
import { medias } from '@server/database/schemas/medias';
import { getErrorResponse } from '@server/h5p/get-error-response';
import { getH5pEditors } from '@server/h5p/get-h5p-editor';
import { getH5pUser } from '@server/h5p/get-h5p-user';
import { getJsonBody } from '@server/h5p/get-json-body';
import { NextResponse, type NextRequest } from 'next/server';

export const GET = async (_request: NextRequest) => {
    const user = await getH5pUser();
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }
    if (user.type !== 'admin') {
        return new Response('Unauthorized', { status: 403 });
    }

    const { h5pEditor } = await getH5pEditors();
    if (!h5pEditor) {
        return new Response('H5P not initialized', { status: 500 });
    }

    try {
        const contentIds = await h5pEditor.contentManager.listContent(undefined);
        const contentObjects = await Promise.all(
            contentIds.map(async (id) => ({
                content: await h5pEditor.contentManager.getContentMetadata(id, user),
                id,
            })),
        );
        return NextResponse.json(
            contentObjects.map((o) => ({
                contentId: o.id,
                title: o.content.title,
                mainLibrary: o.content.mainLibrary,
            })),
        );
    } catch (error) {
        return getErrorResponse(error);
    }
};

export const POST = async (request: NextRequest) => {
    const user = await getH5pUser();
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }
    if (user.type !== 'admin') {
        return new Response('Unauthorized', { status: 403 });
    }

    const body = await getJsonBody(request);
    const { h5pEditor } = await getH5pEditors();
    if (!h5pEditor) {
        return new Response('H5P not initialized', { status: 500 });
    }

    try {
        const { id: contentId, metadata } = await h5pEditor.saveOrUpdateContentReturnMetaData(
            undefined as unknown as string,
            body.params.params,
            body.params.metadata,
            body.library,
            user,
        );
        await db.insert(medias).values({
            id: contentId,
            userId: user.id,
            type: 'h5p',
            url: '',
            metadata: {
                title: body.params.metadata.title,
                library: body.library,
            },
        });
        return NextResponse.json({
            contentId,
            metadata,
        });
    } catch (error) {
        return getErrorResponse(error);
    }
};
