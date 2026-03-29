import { CancelablePromise } from '@lib/cancelablePromise';
import { spawn } from 'node:child_process';

import type { AudioMixJob, AudioMixTrack } from './types';

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

/**
 * Runs the ffmpeg mix command.
 * @param job - The job to run.
 * @param inputFiles - The input files to mix.
 * @param outputFilePath - The path to the output file.
 * @returns A promise that resolves when the mix is complete.
 */
export const runFfmpegMix = (job: AudioMixJob, inputFiles: string[], outputFilePath: string) => {
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
        };

        child.stderr?.on('data', onStderrData);

        child.once('error', (error) => {
            cleanup();
            reject(error);
        });

        child.once('close', (code, signal) => {
            cleanup();

            if (job.abortController.signal.aborted) {
                reject(new Error('Audio mix canceled'));
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
