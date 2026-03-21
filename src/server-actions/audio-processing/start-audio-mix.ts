'use server';

import { ADMIN_AUDIO_MIX_KEY, ADMIN_AUDIO_MIX_URL } from '@server/audio-processing/admin-audio-mix';
import { processAudioMix } from '@server/audio-processing/audio-mixing';
import type { AudioMixTrack } from '@server/audio-processing/types';
import { getCurrentUser } from '@server/helpers/get-current-user';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';

export const startAudioMix = async (
    tracks: AudioMixTrack[],
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

        if (user.role !== 'admin') {
            return {
                error: {
                    message: 'Forbidden',
                },
            };
        }

        await processAudioMix(tracks, ADMIN_AUDIO_MIX_KEY);

        return {
            data: {
                outputUrl: ADMIN_AUDIO_MIX_URL,
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
