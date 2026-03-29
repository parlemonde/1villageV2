export interface AudioMixTrack {
    sourceKey: string;
    delayMs?: number;
    gain?: number;
    trimStartMs?: number;
    trimEndMs?: number;
}

export interface AudioMixJob {
    uuid: string;
    userId: string;
    name: string;
    tracks: AudioMixTrack[];
    abortController: AbortController;
}
