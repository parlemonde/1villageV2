import { CancelablePromise } from '@lib/cancelablePromise';
import { getFileData, uploadFile } from '@server/files/file-upload';
import mime from 'mime-types';
import { createReadStream } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { resolveTrackSourcesToFiles } from './resolve-tracks';
import { runFfmpegMix } from './run-ffmpeg';
import type { AudioMixJob, AudioMixTrack } from './types';
import { validateAudioMixTrack } from './validate-track';

let pendingJobs: AudioMixJob[] = [];
let currentJob: AudioMixJob | null = null;
let isProcessingQueue = false;

const validateMixRequest = (tracks: AudioMixTrack[], outputKey: string) => {
    if (tracks.length === 0) {
        throw new Error('At least one audio track is required');
    }
    if (!outputKey.startsWith('media/')) {
        throw new Error('Audio mix output key must start with "media/"');
    }
    if (path.extname(outputKey) === '') {
        throw new Error('Audio mix key must include a file extension');
    }
    tracks.forEach((track, index) => validateAudioMixTrack(track, index));
};

const cancelQueuedJobsForKey = (outputKey: string) => {
    pendingJobs = pendingJobs.filter((job) => {
        if (job.outputKey !== outputKey) {
            return true;
        }
        job.abortController.abort();
        return false;
    });
};
const cancelRunningJobForKey = (outputKey: string) => {
    if (currentJob === null || currentJob.outputKey !== outputKey) {
        return;
    }
    currentJob.abortController.abort();
};

const processJob = async (job: AudioMixJob) => {
    const workdir = await CancelablePromise.from(() => mkdtemp(path.join(tmpdir(), 'audio-mix-')), job.abortController);
    try {
        const inputFiles = await resolveTrackSourcesToFiles(job, workdir);
        const outputFilePath = path.join(workdir, `output${path.extname(job.outputKey)}`);
        await runFfmpegMix(job, inputFiles, outputFilePath);
        const contentType = mime.lookup(job.outputKey);
        await uploadFile(job.outputKey, createReadStream(outputFilePath), contentType === false ? undefined : contentType, job.abortController);
    } finally {
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
            if (job === undefined || job.abortController.signal.aborted) {
                continue;
            }
            currentJob = job;
            try {
                await processJob(job);
            } finally {
                currentJob = null;
            }
        }
    } finally {
        isProcessingQueue = false;
    }
};

export const processAudioMix = async (tracks: AudioMixTrack[], outputKey: string): Promise<void> => {
    validateMixRequest(tracks, outputKey);
    cancelQueuedJobsForKey(outputKey);
    cancelRunningJobForKey(outputKey);
    const job: AudioMixJob = {
        outputKey,
        tracks,
        abortController: new AbortController(),
    };
    pendingJobs.push(job);
    void processQueue();
};

export const getAudioMixStatus = async (outputKey: string): Promise<'queued' | 'processing' | 'completed' | 'not-found'> => {
    if (currentJob && !currentJob.abortController.signal.aborted && currentJob.outputKey === outputKey) {
        return 'processing';
    }
    if (pendingJobs.some((job) => job.outputKey === outputKey)) {
        return 'queued';
    }
    if ((await getFileData(outputKey)) !== null) {
        return 'completed';
    }
    return 'not-found';
};
