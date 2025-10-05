import { AjaxSuccessResponse } from '@lumieducation/h5p-server';
import { getErrorResponse } from '@server/h5p/get-error-response';
import { getH5pEditors } from '@server/h5p/get-h5p-editor';
import { getH5pUser } from '@server/h5p/get-h5p-user';
import { getJsonBody } from '@server/h5p/get-json-body';
import { NextResponse, type NextRequest } from 'next/server';
import { createLoader, parseAsString } from 'nuqs/server';

const getParams = {
    contextId: parseAsString,
    asUserId: parseAsString,
};
const loadGetParams = createLoader(getParams);

export const GET = async (request: NextRequest, { params }: { params: Promise<{ contentId: string; dataType: string; subContentId: string }> }) => {
    const user = await getH5pUser();
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { contentId, dataType, subContentId } = await params;
    const { contextId, asUserId } = loadGetParams(request.nextUrl.searchParams, {});
    const { h5pEditor } = await getH5pEditors();
    if (!h5pEditor) {
        return new Response('H5P not initialized', { status: 500 });
    }

    if (!h5pEditor.config.contentUserStateSaveInterval || !h5pEditor.contentUserDataManager) {
        return new Response('Content user data is not enabled', { status: 403 });
    }

    try {
        const result = await h5pEditor.contentUserDataManager.getContentUserData(
            contentId,
            dataType,
            subContentId,
            user,
            contextId ?? undefined,
            asUserId ?? undefined,
        );
        if (!result || !result.userState) {
            return NextResponse.json(new AjaxSuccessResponse(false));
        } else {
            return NextResponse.json(new AjaxSuccessResponse(result.userState));
        }
    } catch (error) {
        return getErrorResponse(error);
    }
};

const postParams = {
    contextId: parseAsString,
    asUserId: parseAsString,
    ignorePost: parseAsString,
};
const loadPostParams = createLoader(postParams);
export const POST = async (request: NextRequest, { params }: { params: Promise<{ contentId: string; dataType: string; subContentId: string }> }) => {
    const user = await getH5pUser();
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { contentId, dataType, subContentId } = await params;
    const { contextId, ignorePost, asUserId } = loadPostParams(request.nextUrl.searchParams, {});

    // The ignorePost query parameter allows us to cancel requests that
    // would fail later, when the ContentUserDataManager would deny write
    // requests to user states. It is necessary, as the H5P JavaScript core
    // client doesn't support displaying a state while saving is disabled.
    // We implement this feature by setting a very long autosave frequency,
    // rejecting write requests in the permission system and using the
    // ignorePost query parameter.
    if (ignorePost == 'yes') {
        return NextResponse.json(new AjaxSuccessResponse(undefined, 'The user state was not saved, as the query parameter ignorePost was set.'));
    }

    const { h5pEditor } = await getH5pEditors();
    if (!h5pEditor) {
        return new Response('H5P not initialized', { status: 500 });
    }

    if (!h5pEditor.config.contentUserStateSaveInterval || !h5pEditor.contentUserDataManager) {
        return new Response('Content user data is not enabled', { status: 403 });
    }

    try {
        const body = await getJsonBody(request);
        await h5pEditor.contentUserDataManager.createOrUpdateContentUserData(
            contentId,
            dataType,
            subContentId,
            body.data,
            body.invalidate === 1 || body.invalidate === '1',
            body.preload === 1 || body.preload === '1',
            user,
            contextId ?? undefined,
            asUserId ?? undefined,
        );
        return NextResponse.json(new AjaxSuccessResponse(undefined));
    } catch (error) {
        return getErrorResponse(error);
    }
};
