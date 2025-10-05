import { getErrorResponse } from '@server/h5p/get-error-response';
import { getH5pEditors } from '@server/h5p/get-h5p-editor';
import { getH5pUser } from '@server/h5p/get-h5p-user';
import { getJsonBody } from '@server/h5p/get-json-body';
import { NextResponse, type NextRequest } from 'next/server';
import { createLoader, parseAsString } from 'nuqs/server';
import qs from 'qs';

const H5pAjaxGetQueryParams = {
    action: parseAsString.withDefault(''),
    machineName: parseAsString,
    majorVersion: parseAsString,
    minorVersion: parseAsString,
};
const loadH5pAjaxGetQueryParams = createLoader(H5pAjaxGetQueryParams);
export async function GET({ nextUrl }: NextRequest) {
    const user = await getH5pUser();

    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { action, machineName, majorVersion, minorVersion } = loadH5pAjaxGetQueryParams(nextUrl.searchParams, {});
    const { h5pEditorAjax } = await getH5pEditors();
    if (!h5pEditorAjax) {
        return new Response('H5P not initialized', { status: 500 });
    }
    try {
        const response = await h5pEditorAjax.getAjax(
            action,
            machineName ?? undefined,
            majorVersion ?? undefined,
            minorVersion ?? undefined,
            'fr',
            user,
        );
        return NextResponse.json(response);
    } catch (error) {
        return getErrorResponse(error);
    }
}

interface H5pFile {
    data: Buffer;
    mimetype: string;
    name: string;
    size: number;
    tempFilePath?: string;
}

const H5pAjaxPostQueryParams = {
    action: parseAsString.withDefault(''),
    id: parseAsString,
    hubId: parseAsString,
};
const loadH5pAjaxPostQueryParams = createLoader(H5pAjaxPostQueryParams);
export async function POST(request: NextRequest) {
    const user = await getH5pUser();
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { action, id, hubId } = loadH5pAjaxPostQueryParams(request.nextUrl.searchParams, {});
    const { h5pEditorAjax } = await getH5pEditors();
    if (!h5pEditorAjax) {
        return new Response('H5P not initialized', { status: 500 });
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let body: any = {};
        let anyFile: H5pFile | undefined = undefined;
        let h5pFile: H5pFile | undefined = undefined;
        if (request.headers.get('content-type')?.startsWith('multipart/form-data')) {
            const formData = await request.formData();
            const maybeAnyFile = formData.get('file');
            const maybeH5pFile = formData.get('h5p');
            if (maybeAnyFile instanceof File) {
                anyFile = {
                    data: Buffer.from(await maybeAnyFile.arrayBuffer()),
                    mimetype: maybeAnyFile.type,
                    name: maybeAnyFile.name,
                    size: maybeAnyFile.size,
                };
            }
            if (maybeH5pFile instanceof File) {
                h5pFile = {
                    data: Buffer.from(await maybeH5pFile.arrayBuffer()),
                    mimetype: maybeH5pFile.type,
                    name: maybeH5pFile.name,
                    size: maybeH5pFile.size,
                };
            }
            const queryString = [...formData.entries()]
                .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(`${value}`))
                .join('&');
            body = qs.parse(queryString);
        } else {
            body = await getJsonBody(request);
        }

        const response = await h5pEditorAjax.postAjax(
            action,
            body,
            'fr',
            user,
            anyFile,
            id ?? undefined,
            undefined, // Translation function. None for now.
            h5pFile,
            hubId ?? undefined,
        );
        return NextResponse.json(response);
    } catch (error) {
        return getErrorResponse(error);
    }
}
