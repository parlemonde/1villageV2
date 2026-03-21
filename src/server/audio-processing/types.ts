export interface AudioMixTrack {
    sourceKey: string;
    delayMs?: number;
    gain?: number;
    trimStartMs?: number;
    trimEndMs?: number;
}

export interface AudioMixJob {
    outputKey: string;
    tracks: AudioMixTrack[];
    abortController: AbortController;
}
