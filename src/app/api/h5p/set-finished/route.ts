import { AjaxSuccessResponse } from '@lumieducation/h5p-server';
import { getErrorResponse } from '@server/h5p/get-error-response';
import { getH5pEditors } from '@server/h5p/get-h5p-editor';
import { getH5pUser } from '@server/h5p/get-h5p-user';
import { getJsonBody } from '@server/h5p/get-json-body';
import { NextResponse, type NextRequest } from 'next/server';

export const POST = async (request: NextRequest) => {
    const user = await getH5pUser();
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { h5pEditor } = await getH5pEditors();
    if (!h5pEditor) {
        return new Response('H5P not initialized', { status: 500 });
    }

    if (!h5pEditor.config.setFinishedEnabled || !h5pEditor.contentUserDataStorage) {
        return new Response('Set finished is not enabled', { status: 403 });
    }

    try {
        const { contentId, score, maxScore, opened, finished, time } = await getJsonBody(request);
        await h5pEditor.contentUserDataManager.setFinished(contentId, score, maxScore, opened, finished, time, user);
        return NextResponse.json(new AjaxSuccessResponse(undefined));
    } catch (error) {
        return getErrorResponse(error);
    }
};
