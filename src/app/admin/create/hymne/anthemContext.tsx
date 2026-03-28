'use client';

import { sendToast } from '@frontend/components/Toasts';
import type { AudioMixTrack } from '@server/audio-processing/types';
import type { AnthemActivity } from '@server/database/schemas/activity-types';
import { startAudioMix } from '@server-actions/audio-processing/start-audio-mix';
import { createContext, useCallback, useMemo, useRef, useState } from 'react';
import isEqual from 'react-fast-compare';

const DEFAULT_ANTHEM_ACTIVITY: AnthemActivity = {
    type: 'hymne',
    data: {
        vocalTrack: {
            name: 'Piste vocale La La',
            iconUrl: '/static/anthem/accordion.svg',
        },
        verseTracks: [
            {
                name: 'Piste harmonique 1',
                iconUrl: '/static/anthem/saxophone.svg',
            },
            {
                name: 'Piste mélodique 1',
                iconUrl: '/static/anthem/electric_guitar.svg',
            },
            {
                name: 'Piste mélodique 2',
                iconUrl: '/static/anthem/piano.svg',
            },
            {
                name: 'Piste rythmique 1',
                iconUrl: '/static/anthem/jazz_set.svg',
            },
        ],
        introTrack: {
            name: 'Intro + Refrain chanté',
            iconUrl: '/static/anthem/accordion.svg',
        },
        outroTrack: {
            name: 'Outro',
            iconUrl: '/static/anthem/accordion.svg',
        },
        chorusSyllables: [
            ['LA', 'LA'],
            ['LA', 'LA', 'LA'],
        ],
        verseSyllables: [
            ['LA', 'LA'],
            ['LA', 'LA', 'LA'],
        ],
    },
};

const buildVerseTracksToMix = (anthemActivity: AnthemActivity): AudioMixTrack[] => {
    const verseTracks = (anthemActivity.data.verseTracks || [])
        .map((track) => ({ sourceKey: track.url || '', delayMs: 0, gain: 1 }))
        .filter((track) => track.sourceKey !== '');
    if (verseTracks.length === 0) {
        return [];
    }
    return verseTracks.map((track) => ({ ...track, delayMs: 0 }));
};

const buildFullTracksToMix = (anthemActivity: AnthemActivity): AudioMixTrack[] => {
    const verseTracks = (anthemActivity.data.verseTracks || [])
        .map((track) => ({ sourceKey: track.url || '', delayMs: 0, gain: 1 }))
        .filter((track) => track.sourceKey !== '');
    if (verseTracks.length === 0) {
        return [];
    }

    const tracksToMix: AudioMixTrack[] = [];
    let currentDuration = 0;

    // Add the intro track
    if (anthemActivity.data.introTrack?.url && anthemActivity.data.introDurationMs) {
        tracksToMix.push({ sourceKey: anthemActivity.data.introTrack.url, delayMs: 0, gain: 1 });
        currentDuration += anthemActivity.data.introDurationMs;
    }

    // Add the verse tracks
    if (anthemActivity.data.verseDurationMs) {
        tracksToMix.push(...verseTracks.map((track) => ({ ...track, delayMs: currentDuration })));
        if (anthemActivity.data.vocalTrack?.url) {
            tracksToMix.push({
                sourceKey: anthemActivity.data.vocalTrack.url,
                delayMs: currentDuration,
                gain: 1,
                trimEndMs: anthemActivity.data.verseDurationMs,
            });
        }
        currentDuration += anthemActivity.data.verseDurationMs;
    }

    // Add the outro track
    if (anthemActivity.data.outroTrack?.url) {
        tracksToMix.push({ sourceKey: anthemActivity.data.outroTrack.url, delayMs: currentDuration, gain: 1 });
    }

    return tracksToMix;
};

export const AnthemContext = createContext<{
    activityId?: number;
    anthemActivity: AnthemActivity;
    mixAudioFiles: () => Promise<void>;
    setAnthemActivity: (anthemActivity: AnthemActivity) => void;
}>({
    anthemActivity: DEFAULT_ANTHEM_ACTIVITY,
    mixAudioFiles: () => Promise.resolve(),
    setAnthemActivity: () => {},
});

interface AnthemProviderProps {
    activityId?: number;
    initialAnthemActivity?: AnthemActivity;
}
export const AnthemProvider = ({
    activityId,
    initialAnthemActivity = DEFAULT_ANTHEM_ACTIVITY,
    children,
}: React.PropsWithChildren<AnthemProviderProps>) => {
    const [anthemActivity, setAnthemActivity] = useState<AnthemActivity>(initialAnthemActivity);

    const lastBuiltVerseTracks = useRef<AudioMixTrack[]>(buildVerseTracksToMix(anthemActivity));
    const mixVerseTracks = useCallback(async () => {
        const tracksToMix = buildVerseTracksToMix(anthemActivity);
        if (isEqual(tracksToMix, lastBuiltVerseTracks.current)) {
            return anthemActivity.data.anthemVerseAudioUrl;
        }
        lastBuiltVerseTracks.current = tracksToMix;
        if (tracksToMix.length === 0) {
            return undefined;
        }
        try {
            const response = await startAudioMix(tracksToMix, 'hymne-couplet');
            if (response.error) {
                throw Error(response.error.message);
            }
            return response.data?.outputUrl;
        } catch (error) {
            console.error(error);
            sendToast({
                message: 'Une erreur est survenue lors du mixage',
                type: 'error',
            });
            return undefined;
        }
    }, [anthemActivity]);

    const lastBuiltFullTracks = useRef<AudioMixTrack[]>(buildFullTracksToMix(anthemActivity));
    const mixFullTracks = useCallback(async () => {
        const tracksToMix = buildFullTracksToMix(anthemActivity);
        if (isEqual(tracksToMix, lastBuiltFullTracks.current)) {
            return anthemActivity.data.anthemFullAudioUrl;
        }
        lastBuiltFullTracks.current = tracksToMix;
        if (tracksToMix.length === 0) {
            return undefined;
        }
        try {
            const response = await startAudioMix(tracksToMix, 'hymne-intro-refrain-couplet-outro');
            if (response.error) {
                throw Error(response.error.message);
            }
            return response.data?.outputUrl;
        } catch (error) {
            console.error(error);
            sendToast({
                message: 'Une erreur est survenue lors du mixage',
                type: 'error',
            });
            return undefined;
        }
    }, [anthemActivity]);

    const mixAudioFiles = useCallback(async () => {
        const [verseAudioUrl, fullAudioUrl] = await Promise.all([mixVerseTracks(), mixFullTracks()]);
        setAnthemActivity({
            ...anthemActivity,
            data: {
                ...anthemActivity.data,
                anthemVerseAudioUrl: verseAudioUrl,
                anthemFullAudioUrl: fullAudioUrl,
            },
        });
    }, [anthemActivity, setAnthemActivity, mixVerseTracks, mixFullTracks]);

    const value = useMemo(
        () => ({ activityId, anthemActivity, mixAudioFiles, setAnthemActivity }),
        [activityId, anthemActivity, mixAudioFiles, setAnthemActivity],
    );

    return <AnthemContext.Provider value={value}>{children}</AnthemContext.Provider>;
};
