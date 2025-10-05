import { getErrorResponse } from '@server/h5p/get-error-response';
import { getH5pEditors } from '@server/h5p/get-h5p-editor';
import { getH5pUser } from '@server/h5p/get-h5p-user';
import { NextResponse, type NextRequest } from 'next/server';
import { createLoader, parseAsString } from 'nuqs/server';

const getParams = {
    contextId: parseAsString,
};
const loadGetParams = createLoader(getParams);
export const GET = async (request: NextRequest, { params }: { params: Promise<{ contentId: string }> }) => {
    const user = await getH5pUser();
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { contentId } = await params;
    const { contextId } = loadGetParams(request.nextUrl.searchParams, {});
    const { h5pPlayer } = await getH5pEditors();
    if (!h5pPlayer) {
        return new Response('H5P not initialized', { status: 500 });
    }

    try {
        const content: unknown = await h5pPlayer.render(contentId, user, 'fr', {
            contextId: contextId ?? undefined,
        });
        return NextResponse.json(content);
    } catch (error) {
        return getErrorResponse(error);
    }
};
