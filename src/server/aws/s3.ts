import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { FileData } from '@server/files/files.types';
import { getBuffer } from '@server/lib/get-buffer';
import { getEnvVariable } from '@server/lib/get-env-variable';
import type Stream from 'node:stream';
import type { ReadableStream } from 'node:stream/web';
import { Readable } from 'stream';

import { getAwsClient } from './aws-client';

const S3_BASE_URL = `https://${getEnvVariable('S3_BUCKET_NAME')}.s3.${getEnvVariable('AWS_REGION')}.amazonaws.com`;
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

export async function uploadS3File(key: string, filedata: Buffer | Readable | Stream, contentType?: string): Promise<void> {
    try {
        const buffer = await getBuffer(filedata);
        const awsClient = getAwsClient();
        await awsClient.fetch(getS3FileUrl(key), {
            method: 'PUT',
            body: buffer as unknown as BodyInit,
            headers: {
                'Content-Length': buffer.length.toString(),
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

export async function listS3Files(
    prefix: string,
    continuationToken?: string,
): Promise<{
    files: string[];
    nextContinuationToken?: string;
}> {
    try {
        const awsClient = getAwsClient();
        const response = await awsClient.fetch(
            `${S3_BASE_URL}/${serializeToQueryUrl({
                'list-type': '2',
                prefix,
                'continuation-token': continuationToken,
            })}`,
            {
                method: 'GET',
            },
        );
        const data = await response.json();
        return {
            files: data.Contents.map((c: { Key: string }) => c.Key),
            nextContinuationToken: data.IsTruncated ? data['NextContinuationToken'] : undefined,
        };
    } catch (e) {
        console.error(e);
        return { files: [] };
    }
}

export async function listS3Folders(prefix: string): Promise<string[]> {
    try {
        const awsClient = getAwsClient();
        const folders = new Set<string>();
        let continuationToken: string | undefined;

        // Boucle pour gérer la pagination
        do {
            const response = await awsClient.fetch(
                `${S3_BASE_URL}/${serializeToQueryUrl({
                    'list-type': '2',
                    prefix: prefix.endsWith('/') ? prefix : `${prefix}/`,
                    'continuation-token': continuationToken,
                    delimiter: '/',
                })}`,
                {
                    method: 'GET',
                },
            );
            const data = await response.json();

            // Ajouter les prefixes communs (CommonPrefixes) qui représentent les dossiers
            if (data.CommonPrefixes) {
                for (const cp of data.CommonPrefixes) {
                    const folderPath = cp.Prefix as string;
                    // Extraire le nom du dossier sans le préfixe et sans le slash final
                    const folderName = folderPath.replace(prefix.endsWith('/') ? prefix : `${prefix}/`, '').replace(/\/$/, '');
                    if (folderName) {
                        folders.add(folderName);
                    }
                }
            }

            continuationToken = data.IsTruncated ? data['NextContinuationToken'] : undefined;
        } while (continuationToken);

        return Array.from(folders).sort();
    } catch (e) {
        console.error(e);
        return [];
    }
}
