import { CancelablePromise } from '@lib/cancelablePromise';
import { getFileData, uploadFile } from '@server/files/file-upload';
import { registerService } from '@server/lib/register-service';
import { createReadStream } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { v4 } from 'uuid';

import { resolveTrackSourcesToFiles } from './resolve-tracks';
import { runFfmpegMix } from './run-ffmpeg';
import type { AudioMixJob, AudioMixTrack } from './types';
import { validateAudioMixTrack } from './validate-track';

interface ProcessJobSingleton {
    pendingJobs: AudioMixJob[];
    currentJob: AudioMixJob | null;
    isProcessingQueue: boolean;
}
const processJobSingleton = registerService<ProcessJobSingleton>('processJobSingleton', () => ({
    pendingJobs: [],
    currentJob: null,
    isProcessingQueue: false,
}));

const validateMixRequest = (tracks: AudioMixTrack[]) => {
    if (tracks.length === 0) {
        throw new Error('At least one audio track is required');
    }
    tracks.forEach((track, index) => validateAudioMixTrack(track, index));
};

const cancelQueuedJobs = (name: string, userId: string) => {
    processJobSingleton.pendingJobs = processJobSingleton.pendingJobs.filter((job) => {
        if (job.name !== name || job.userId !== userId) {
            return true;
        }
        job.abortController.abort();
        return false;
    });
};
const cancelRunningJob = (name: string, userId: string) => {
    if (processJobSingleton.currentJob === null || processJobSingleton.currentJob.name !== name || processJobSingleton.currentJob.userId !== userId) {
        return;
    }
    processJobSingleton.currentJob.abortController.abort();
};

const processJob = async (job: AudioMixJob) => {
    const workdir = await CancelablePromise.from(() => mkdtemp(path.join(tmpdir(), 'audio-mix-')), job.abortController);
    try {
        const inputFiles = await resolveTrackSourcesToFiles(job, workdir);
        const outputFilePath = path.join(workdir, 'output.mp3');
        await runFfmpegMix(job, inputFiles, outputFilePath);
        const outputKey = path.join('media/audios/users', job.userId, job.uuid, `${job.name}.mp3`);
        await uploadFile(outputKey, createReadStream(outputFilePath), 'audio/mp3', job.abortController);
    } finally {
        await rm(workdir, {
            recursive: true,
            force: true,
        });
    }
};

const processQueue = async () => {
    if (processJobSingleton.isProcessingQueue) {
        return;
    }
    processJobSingleton.isProcessingQueue = true;

    try {
        while (processJobSingleton.pendingJobs.length > 0) {
            const job = processJobSingleton.pendingJobs.shift();
            if (job === undefined || job.abortController.signal.aborted) {
                continue;
            }
            processJobSingleton.currentJob = job;
            try {
                await processJob(job);
            } finally {
                processJobSingleton.currentJob = null;
            }
        }
    } finally {
        processJobSingleton.isProcessingQueue = false;
    }
};

export const processAudioMix = async (tracks: AudioMixTrack[], name: string, userId: string): Promise<string> => {
    validateMixRequest(tracks);
    cancelQueuedJobs(name, userId);
    cancelRunningJob(name, userId);
    const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const job: AudioMixJob = {
        uuid: v4(),
        userId,
        name: sanitizedName,
        tracks,
        abortController: new AbortController(),
    };
    processJobSingleton.pendingJobs.push(job);
    void processQueue();
    return `/media/audios/users/${userId}/${job.uuid}/${sanitizedName}.mp3`;
};

export const getAudioMixStatus = async (src: string): Promise<'queued' | 'processing' | 'completed' | 'not-found'> => {
    if (!src.startsWith('/media/audios/users/')) {
        return 'not-found';
    }

    const parsed = src.slice('/media/audios/users/'.length).split('/');
    if (parsed.length !== 3) {
        return 'not-found';
    }

    const [userId, _uuid, fullName] = parsed;
    const name = fullName.slice(0, -4);
    if (
        processJobSingleton.currentJob &&
        !processJobSingleton.currentJob.abortController.signal.aborted &&
        processJobSingleton.currentJob.name === name &&
        processJobSingleton.currentJob.userId === userId
    ) {
        return 'processing';
    }
    if (processJobSingleton.pendingJobs.some((job) => job.name === name && job.userId === userId)) {
        return 'queued';
    }
    // remove the leading slash in src
    if ((await getFileData(src.slice(1))) !== null) {
        return 'completed';
    }
    return 'not-found';
};
