import { getAudioMixStatus } from '@server/audio-processing/audio-mixing';
import { getCurrentUser } from '@server/helpers/get-current-user';
import type { NextRequest } from 'next/server';
import { createLoader, parseAsString } from 'nuqs/server';

const audiosMixSearchParams = {
    src: parseAsString.withDefault(''),
};
const loadSearchParams = createLoader(audiosMixSearchParams);

export async function GET({ nextUrl }: NextRequest) {
    const user = await getCurrentUser();
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }
    const { src } = loadSearchParams(nextUrl.searchParams);
    const status = await getAudioMixStatus(src);
    return Response.json({
        status,
    });
}
