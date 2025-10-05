import type { IEditorModel } from '@lumieducation/h5p-server';
import { getErrorResponse } from '@server/h5p/get-error-response';
import { getH5pEditors } from '@server/h5p/get-h5p-editor';
import { getH5pUser } from '@server/h5p/get-h5p-user';
import { NextResponse, type NextRequest } from 'next/server';

export const GET = async (_request: NextRequest, { params }: { params: Promise<{ contentId: string }> }) => {
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
        const editorModel: IEditorModel = await h5pEditor.render(contentId === 'new' ? (undefined as unknown as string) : contentId, 'fr', user);

        // New content render html
        if (contentId === 'new') {
            return NextResponse.json(editorModel);
        }

        // Existing content return json
        const content = await h5pEditor.getContent(contentId, user);
        return NextResponse.json({
            ...editorModel,
            library: content.library,
            metadata: content.params.metadata,
            params: content.params.params,
        });
    } catch (error) {
        return getErrorResponse(error);
    }
};
