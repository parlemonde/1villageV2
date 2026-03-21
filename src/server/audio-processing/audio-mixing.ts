import { CancelablePromise, isCancelablePromiseCanceledError } from '@lib/cancelablePromise';
import { getFile, uploadFile } from '@server/files/file-upload';
import { getBuffer } from '@server/lib/get-buffer';
import { logger } from '@server/lib/logger';
import mime from 'mime-types';
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { AudioMixStatusSnapshot, AudioMixTrack } from './types';

interface AudioMixJob {
    id: string;
    key: string;
    tracks: AudioMixTrack[];
    queuedAt: string;
    cancelRequested: boolean;
    abortController: AbortController;
}

interface InternalAudioMixStatusSnapshot extends AudioMixStatusSnapshot {
    jobId: string;
}

class AudioMixCancelledError extends Error {
    constructor(message = 'Audio mix cancelled') {
        super(message);
        this.name = 'AudioMixCancelledError';
    }
}

let pendingJobs: AudioMixJob[] = [];
const statusesByKey = new Map<string, InternalAudioMixStatusSnapshot>();
let currentJob: AudioMixJob | null = null;
let currentChild: ChildProcess | null = null;
let isProcessingQueue = false;

const MEDIA_AUDIO_PREFIX = '/media/audios';
const isInternalMediaSource = (sourceKey: string) => sourceKey.startsWith(MEDIA_AUDIO_PREFIX);
const isTerminalStatus = (status: InternalAudioMixStatusSnapshot['status']) =>
    status === 'completed' || status === 'failed' || status === 'cancelled';

const toPublicStatusSnapshot = (snapshot: InternalAudioMixStatusSnapshot): AudioMixStatusSnapshot => ({
    key: snapshot.key,
    status: snapshot.status,
    queuedAt: snapshot.queuedAt,
    startedAt: snapshot.startedAt,
    finishedAt: snapshot.finishedAt,
    error: snapshot.error,
});

const getNowIsoString = () => new Date().toISOString();

const ensureFiniteNumber = (value: number, field: string, allowZero = true) => {
    if (!Number.isFinite(value) || (!allowZero && value <= 0) || (allowZero && value < 0)) {
        throw new Error(`Invalid ${field}`);
    }
};

const validateRemoteSourceUrl = (sourceKey: string) => {
    let url: URL;
    try {
        url = new URL(sourceKey);
    } catch {
        throw new Error(`Invalid source URL: ${sourceKey}`);
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error(`Unsupported source URL protocol: ${sourceKey}`);
    }

    return url;
};

const validateTrack = (track: AudioMixTrack, index: number) => {
    if (track.sourceKey.trim() === '') {
        throw new Error(`Track ${index} is missing a source`);
    }

    ensureFiniteNumber(track.delayMs, `track ${index} delayMs`);
    ensureFiniteNumber(track.gain, `track ${index} gain`);

    if (track.trimStartMs !== undefined) {
        ensureFiniteNumber(track.trimStartMs, `track ${index} trimStartMs`);
    }

    if (track.trimEndMs !== undefined) {
        ensureFiniteNumber(track.trimEndMs, `track ${index} trimEndMs`);
    }

    if (track.trimStartMs !== undefined && track.trimEndMs !== undefined && track.trimEndMs <= track.trimStartMs) {
        throw new Error(`Track ${index} has an invalid trim range`);
    }

    if (!isInternalMediaSource(track.sourceKey)) {
        validateRemoteSourceUrl(track.sourceKey);
    }
};

const validateMixRequest = (tracks: AudioMixTrack[], key: string) => {
    if (tracks.length === 0) {
        throw new Error('At least one audio track is required');
    }

    if (!key.startsWith('media/')) {
        throw new Error('Audio mix key must start with "media/"');
    }

    if (path.extname(key) === '') {
        throw new Error('Audio mix key must include a file extension');
    }

    tracks.forEach((track, index) => validateTrack(track, index));
};

const setLatestStatus = (job: AudioMixJob, status: InternalAudioMixStatusSnapshot['status'], error?: string) => {
    const existingStatus = statusesByKey.get(job.key);

    if (existingStatus !== undefined && existingStatus.jobId !== job.id) {
        return;
    }

    const now = getNowIsoString();
    const nextStatus: InternalAudioMixStatusSnapshot = {
        jobId: job.id,
        key: job.key,
        status,
        queuedAt: existingStatus?.queuedAt ?? job.queuedAt,
        startedAt: status === 'processing' ? (existingStatus?.startedAt ?? now) : existingStatus?.startedAt,
        finishedAt: isTerminalStatus(status) ? now : undefined,
        error,
    };

    statusesByKey.set(job.key, nextStatus);
};

const queueJobStatus = (job: AudioMixJob) => {
    statusesByKey.set(job.key, {
        jobId: job.id,
        key: job.key,
        status: 'queued',
        queuedAt: job.queuedAt,
    });
};

const getJobStatus = (key: string) => {
    const snapshot = statusesByKey.get(key);
    if (snapshot === undefined) {
        return {
            key,
            status: 'not_found',
        } satisfies AudioMixStatusSnapshot;
    }

    return toPublicStatusSnapshot(snapshot);
};

const cancelQueuedJobsForKey = (key: string) => {
    pendingJobs = pendingJobs.filter((job) => {
        if (job.key !== key) {
            return true;
        }

        job.cancelRequested = true;
        job.abortController.abort();
        return false;
    });
};

const cancelRunningJobForKey = (key: string) => {
    if (currentJob === null || currentJob.key !== key) {
        return;
    }

    currentJob.cancelRequested = true;
    currentJob.abortController.abort();
};

const getTempExtension = (sourceKey: string, contentType?: string | null) => {
    const sourceExtension = path.extname(sourceKey);
    if (sourceExtension !== '') {
        return sourceExtension;
    }

    if (contentType !== undefined && contentType !== null && contentType !== '') {
        const mimeExtension = mime.extension(contentType);
        if (mimeExtension !== false) {
            return `.${mimeExtension}`;
        }
    }

    return '.tmp';
};

const writeSourceToTempFile = (filePath: string, buffer: Buffer, abortController: AbortController) =>
    CancelablePromise.from(async () => {
        await writeFile(filePath, buffer);
        return filePath;
    }, abortController);

const resolveInternalSourceToFile = async (job: AudioMixJob, sourceKey: string, workdir: string, index: number) => {
    const storageKey = sourceKey.slice(1);
    const file = await getFile(storageKey, undefined, job.abortController);

    if (file === null) {
        throw new Error(`Audio source not found: ${sourceKey}`);
    }

    const extension = getTempExtension(storageKey);
    const buffer = await getBuffer(file, job.abortController);

    return writeSourceToTempFile(path.join(workdir, `input-${index}${extension}`), buffer, job.abortController);
};

const resolveRemoteSourceToFile = async (job: AudioMixJob, sourceKey: string, workdir: string, index: number) => {
    const url = validateRemoteSourceUrl(sourceKey);
    const response = await CancelablePromise.from((signal) => fetch(url, { signal }), job.abortController);

    if (!response.ok) {
        throw new Error(`Failed to fetch audio source: ${sourceKey}`);
    }

    const buffer = Buffer.from(
        await CancelablePromise.from(async () => {
            return response.arrayBuffer();
        }, job.abortController),
    );

    const extension = getTempExtension(url.pathname, response.headers.get('content-type'));
    return writeSourceToTempFile(path.join(workdir, `input-${index}${extension}`), buffer, job.abortController);
};

const resolveTrackSourcesToFiles = async (job: AudioMixJob, workdir: string) => {
    const inputFiles: string[] = [];

    for (const [index, track] of job.tracks.entries()) {
        const filePath = isInternalMediaSource(track.sourceKey)
            ? await resolveInternalSourceToFile(job, track.sourceKey, workdir, index)
            : await resolveRemoteSourceToFile(job, track.sourceKey, workdir, index);

        inputFiles.push(filePath);
    }

    return inputFiles;
};

const formatMilliseconds = (value: number) => `${value / 1000}`;

const buildTrackFilter = (track: AudioMixTrack, index: number) => {
    const filterSteps: string[] = [];

    if (track.trimStartMs !== undefined || track.trimEndMs !== undefined) {
        const trimArguments: string[] = [];
        if (track.trimStartMs !== undefined) {
            trimArguments.push(`start=${formatMilliseconds(track.trimStartMs)}`);
        }
        if (track.trimEndMs !== undefined) {
            trimArguments.push(`end=${formatMilliseconds(track.trimEndMs)}`);
        }
        filterSteps.push(`atrim=${trimArguments.join(':')}`);
    }

    filterSteps.push('asetpts=PTS-STARTPTS');
    filterSteps.push(`volume=${track.gain}`);
    filterSteps.push(`adelay=${track.delayMs}:all=1`);

    return `[${index}:a]${filterSteps.join(',')}[a${index}]`;
};

const buildFilterGraph = (tracks: AudioMixTrack[]) => {
    const perTrackFilters = tracks.map((track, index) => buildTrackFilter(track, index));
    const mixedInputs = tracks.map((_track, index) => `[a${index}]`).join('');

    return [...perTrackFilters, `${mixedInputs}amix=inputs=${tracks.length}:duration=longest:dropout_transition=0:normalize=0[mixout]`].join(';');
};

const runFfmpegMix = (job: AudioMixJob, inputFiles: string[], outputFilePath: string) => {
    const ffmpegArgs = [
        '-v',
        'error',
        '-y',
        ...inputFiles.flatMap((inputFile) => ['-i', inputFile]),
        '-filter_complex',
        buildFilterGraph(job.tracks),
        '-map',
        '[mixout]',
        outputFilePath,
    ];

    return new CancelablePromise<void>((resolve, reject) => {
        const child = spawn('ffmpeg', ffmpegArgs, {
            stdio: ['ignore', 'ignore', 'pipe'],
        });
        currentChild = child;

        let stderr = '';
        const onStderrData = (chunk: Buffer | string) => {
            if (stderr.length < 8000) {
                stderr += chunk.toString();
            }
        };
        const cleanup = () => {
            child.stderr?.off('data', onStderrData);
            child.removeAllListeners('error');
            child.removeAllListeners('close');
            if (currentChild === child) {
                currentChild = null;
            }
        };

        child.stderr?.on('data', onStderrData);

        child.once('error', (error) => {
            cleanup();
            reject(error);
        });

        child.once('close', (code, signal) => {
            cleanup();

            if (job.abortController.signal.aborted) {
                reject(new AudioMixCancelledError());
                return;
            }

            if (code === 0) {
                resolve();
                return;
            }

            const exitReason = signal !== null ? `signal ${signal}` : `code ${code}`;
            reject(new Error(stderr || `ffmpeg exited with ${exitReason}`));
        });
        return () => {
            if (child.killed === false) {
                child.kill('SIGKILL');
            }
        };
    }, job.abortController);
};

const processJob = async (job: AudioMixJob) => {
    const workdir = await CancelablePromise.from(() => mkdtemp(path.join(tmpdir(), 'audio-mix-')), job.abortController);

    try {
        setLatestStatus(job, 'processing');

        const inputFiles = await resolveTrackSourcesToFiles(job, workdir);

        const outputFilePath = path.join(workdir, `output${path.extname(job.key)}`);
        await runFfmpegMix(job, inputFiles, outputFilePath);

        const contentType = mime.lookup(job.key);
        await uploadFile(job.key, createReadStream(outputFilePath), contentType === false ? undefined : contentType, job.abortController);

        setLatestStatus(job, 'completed');
    } catch (error) {
        if (error instanceof AudioMixCancelledError || isCancelablePromiseCanceledError(error)) {
            setLatestStatus(job, 'cancelled');
            return;
        }

        const message = error instanceof Error ? error.message : 'Unknown audio mix error';
        logger.error(error, {
            key: job.key,
            jobId: job.id,
        });
        setLatestStatus(job, 'failed', message);
    } finally {
        currentChild = null;
        await rm(workdir, {
            recursive: true,
            force: true,
        });
    }
};

const processQueue = async () => {
    if (isProcessingQueue) {
        return;
    }

    isProcessingQueue = true;

    try {
        while (pendingJobs.length > 0) {
            const job = pendingJobs.shift();

            if (job === undefined || job.cancelRequested) {
                continue;
            }

            currentJob = job;

            try {
                await processJob(job);
            } finally {
                if (currentJob?.id === job.id) {
                    currentJob = null;
                }
                currentChild = null;
            }
        }
    } finally {
        isProcessingQueue = false;

        if (pendingJobs.length > 0) {
            void processQueue();
        }
    }
};

export const processAudioMix = async (tracks: AudioMixTrack[], key: string): Promise<AudioMixStatusSnapshot> => {
    validateMixRequest(tracks, key);

    cancelQueuedJobsForKey(key);
    cancelRunningJobForKey(key);

    const job: AudioMixJob = {
        id: randomUUID(),
        key,
        tracks,
        queuedAt: getNowIsoString(),
        cancelRequested: false,
        abortController: new AbortController(),
    };

    pendingJobs.push(job);
    queueJobStatus(job);

    void processQueue();

    return getJobStatus(key);
};

export const getAudioMixStatus = (key: string): AudioMixStatusSnapshot => {
    return getJobStatus(key);
};
