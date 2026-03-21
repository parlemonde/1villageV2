export interface AudioMixTrack {
    sourceKey: string;
    delayMs: number;
    gain: number;
    trimStartMs?: number;
    trimEndMs?: number;
}

export type AudioMixStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'not_found';

export interface AudioMixStatusSnapshot {
    key: string;
    status: AudioMixStatus;
    queuedAt?: string;
    startedAt?: string;
    finishedAt?: string;
    error?: string;
}
