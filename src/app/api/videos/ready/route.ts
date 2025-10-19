import { getFileData } from '@server/files/file-upload';
import { getCurrentUser } from '@server/helpers/get-current-user';
import type { NextRequest } from 'next/server';
import { createLoader, parseAsString } from 'nuqs/server';

const videoReadyParams = {
    videoUrl: parseAsString.withDefault(''),
};

const loadSearchParams = createLoader(videoReadyParams);

export async function GET(request: NextRequest) {
    const user = await getCurrentUser();
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { videoUrl } = loadSearchParams(request.nextUrl.searchParams);
    if (!videoUrl || !videoUrl.startsWith('media/videos/') || !videoUrl.endsWith('master.m3u8')) {
        return new Response('Video URL is required', { status: 400 });
    }

    const videoMasterFileData = await getFileData(videoUrl);
    return Response.json({ isReady: videoMasterFileData !== null });
}
