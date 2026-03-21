import { CancelablePromise } from '@lib/cancelablePromise';
import { getFile } from '@server/files/file-upload';
import { getBuffer } from '@server/lib/get-buffer';
import mime from 'mime-types';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { AudioMixJob } from './types';
import { isInternalMediaSource } from './validate-track';

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
    let url: URL;
    try {
        url = new URL(sourceKey);
    } catch {
        throw new Error(`Invalid source URL: ${sourceKey}`);
    }

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

/**
 * Resolves the track sources to files.
 * @param job - The job to resolve the tracks for.
 * @param workdir - The work directory to resolve the tracks to.
 * @returns A promise that resolves to the input files.
 */
export const resolveTrackSourcesToFiles = async (job: AudioMixJob, workdir: string) => {
    const inputFiles: string[] = [];

    for (const [index, track] of job.tracks.entries()) {
        const filePath = isInternalMediaSource(track.sourceKey)
            ? await resolveInternalSourceToFile(job, track.sourceKey, workdir, index)
            : await resolveRemoteSourceToFile(job, track.sourceKey, workdir, index);

        inputFiles.push(filePath);
    }

    return inputFiles;
};
