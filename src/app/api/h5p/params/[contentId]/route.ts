import { getErrorResponse } from '@server/h5p/get-error-response';
import { getH5pEditors } from '@server/h5p/get-h5p-editor';
import { getH5pUser } from '@server/h5p/get-h5p-user';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
        const response = await h5pEditorAjax.getContentParameters(contentId, user);
        return NextResponse.json(response);
    } catch (error) {
        return getErrorResponse(error);
    }
};
