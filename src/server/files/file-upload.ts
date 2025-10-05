import { getEnvVariable } from '@server/lib/get-env-variable';
import type { Readable, Stream } from 'node:stream';

import type { FileData } from './files.types';
import { deleteLocalFile, getLocalFile, getLocalFileData, listLocalFiles, uploadLocalFile } from './local';
import { deleteS3File, getS3File, getS3FileData, listS3Files, uploadS3File } from '../aws/s3';

export const USE_S3 = getEnvVariable('AWS_ACCESS_KEY_ID') !== 'local';

export async function uploadFile(fileName: string, fileData: Buffer | Readable | Stream, contentType?: string): Promise<void> {
    if (!fileName) {
        return;
    }
    if (USE_S3) {
        await uploadS3File(fileName, fileData, contentType);
    } else {
        await uploadLocalFile(fileName, fileData);
    }
}

export async function getFileData(fileName: string): Promise<FileData | null> {
    if (!fileName) {
        return null;
    }
    if (USE_S3) {
        return getS3FileData(fileName);
    } else {
        return getLocalFileData(fileName);
    }
}

export async function getFile(fileName: string, range?: string): Promise<Readable | null> {
    if (!fileName) {
        return null;
    }
    if (USE_S3) {
        return getS3File(fileName, range);
    } else {
        return getLocalFile(fileName);
    }
}

export async function deleteFile(fileName: string): Promise<void> {
    if (!fileName) {
        return;
    }
    if (USE_S3) {
        return deleteS3File(fileName);
    } else {
        return deleteLocalFile(fileName);
    }
}

export async function listFiles(
    prefix: string,
    continuationToken?: string,
): Promise<{
    files: string[];
    nextContinuationToken?: string;
}> {
    if (USE_S3) {
        return listS3Files(prefix, continuationToken);
    } else {
        return {
            files: await listLocalFiles(prefix),
        };
    }
}
