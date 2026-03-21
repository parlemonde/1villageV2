import type { AudioMixTrack } from './types';

const MEDIA_AUDIO_PREFIX = '/media/audios';
export const isInternalMediaSource = (sourceKey: string) => sourceKey.startsWith(MEDIA_AUDIO_PREFIX);

/**
 * Throws an error if the source key is not a valid remote URL.
 * @param sourceKey - The source key to validate.
 * @returns The URL object.
 */
const validateRemoteSourceUrl = (name: string, sourceKey: string) => {
    let url: URL;
    try {
        url = new URL(sourceKey);
    } catch {
        throw new Error(`${name} must be a valid URL`);
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error(`${name} must use http or https protocols`);
    }
};

/**
 * Throws an error if the value is not a finite positive number.
 * @param name - The name of the value.
 * @param value - The value to validate.
 */
const validateFinitePositiveNumber = (name: string, value: number | undefined) => {
    if (value === undefined) {
        return;
    }
    if (!Number.isFinite(value) || value < 0) {
        throw new Error(`${name} must be a finite number`);
    }
};

/**
 * Throws an error if the track is invalid.
 * @param track - The track to validate.
 * @param index - The index of the track.
 */
export const validateAudioMixTrack = (track: AudioMixTrack, index?: number) => {
    const trackLabel = index ? `Track ${index}` : 'Track';
    if (track.sourceKey.trim() === '') {
        throw new Error(`${trackLabel} source key is required`);
    }
    validateFinitePositiveNumber(`${trackLabel} delayMs`, track.delayMs);
    validateFinitePositiveNumber(`${trackLabel} gain`, track.gain);
    validateFinitePositiveNumber(`${trackLabel} trimStartMs`, track.trimStartMs);
    validateFinitePositiveNumber(`${trackLabel} trimEndMs`, track.trimEndMs);
    if (track.trimStartMs !== undefined && track.trimEndMs !== undefined && track.trimEndMs <= track.trimStartMs) {
        throw new Error(`${trackLabel} trim end must be greater than trim start`);
    }
    if (!isInternalMediaSource(track.sourceKey)) {
        validateRemoteSourceUrl(trackLabel, track.sourceKey);
    }
};
