'use server';

import { processAudioMix } from '@server/audio-processing/audio-mixing';
import type { AudioMixTrack } from '@server/audio-processing/types';
import { getCurrentUser } from '@server/helpers/get-current-user';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';

export const startAudioMix = async (
    tracks: AudioMixTrack[],
    name: string,
): Promise<
    ServerActionResponse<{
        outputUrl: string;
    }>
> => {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return {
                error: {
                    message: 'Unauthorized',
                },
            };
        }
        const userId = user.role === 'admin' || user.role === 'mediator' ? 'pelico' : user.id;
        const outputUrl = await processAudioMix(tracks, name, userId);
        return {
            data: {
                outputUrl,
            },
        };
    } catch (error) {
        return {
            error: {
                message: error instanceof Error ? error.message : 'Une erreur est survenue lors du lancement du mix.',
            },
        };
    }
};
