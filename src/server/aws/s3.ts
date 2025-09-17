import type { ReadableStream } from 'node:stream/web';
import { Readable } from 'stream';

import { getAwsClient } from './aws-client';
import type { FileData } from '../files/files.types';

const S3_BASE_URL = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
export function getS3FileUrl(key: string): string {
    return `${S3_BASE_URL}/${key}`;
}

export async function getS3File(key: string, range?: string): Promise<Readable | null> {
    try {
        const awsClient = getAwsClient();
        const response = await awsClient.fetch(getS3FileUrl(key), {
            method: 'GET',
            headers: range ? { Range: range } : {},
        });
        if (response.ok) {
            return response.body === null ? null : Readable.fromWeb(response.body as ReadableStream);
        }
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function getS3FileData(key: string): Promise<FileData | null> {
    try {
        const awsClient = getAwsClient();
        const response = await awsClient.fetch(getS3FileUrl(key), {
            method: 'HEAD',
        });
        if (response.ok) {
            return {
                AcceptRanges: response.headers.get('Accept-Ranges') || 'bytes',
                LastModified: new Date(response.headers.get('Last-Modified') || ''),
                ContentLength: Number(response.headers.get('Content-Length')),
                ContentType: response.headers.get('Content-Type') || '',
            };
        }
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function uploadS3File(key: string, filedata: Buffer, contentType?: string): Promise<void> {
    try {
        const awsClient = getAwsClient();
        await awsClient.fetch(getS3FileUrl(key), {
            method: 'PUT',
            body: filedata as unknown as BodyInit,
            headers: {
                'Content-Length': filedata.length.toString(),
                'Content-Type': contentType || 'binary/octet-stream',
            },
        });
    } catch (e) {
        console.error(e);
    }
}

export async function deleteS3File(key: string): Promise<void> {
    try {
        const awsClient = getAwsClient();
        await awsClient.fetch(getS3FileUrl(key), {
            method: 'DELETE',
        });
    } catch (e) {
        console.error(e);
    }
}
