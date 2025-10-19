import { getBuffer } from '@server/lib/get-buffer';
import { getSingleBytesRange } from '@server/lib/get-single-bytes-range';
import fs from 'fs-extra';
import mime from 'mime-types';
import path from 'node:path';
import type { Readable, Stream } from 'node:stream';

import type { FileData } from './files.types';

const temporaryDirectory = process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ? '/tmp' : path.join(process.cwd(), 'tmp');
const getFilePath = (fileUrl: string) => path.join(temporaryDirectory, fileUrl);

export async function getLocalFileData(key: string): Promise<FileData | null> {
    try {
        const stats = fs.statSync(getFilePath(key));
        return {
            AcceptRanges: 'bytes',
            ContentLength: stats.size,
            ContentType: mime.lookup(key) || '',
            LastModified: stats.mtime,
        };
    } catch {
        console.error(`File ${key} not found !`);
        return null;
    }
}

export async function getLocalFile(key: string, range?: string): Promise<Readable | null> {
    try {
        const stats = fs.statSync(getFilePath(key));
        const singleBytesRange = getSingleBytesRange(stats.size, range);
        return fs.createReadStream(getFilePath(key), singleBytesRange ? { start: singleBytesRange.start, end: singleBytesRange.end } : undefined);
    } catch {
        console.error(`File ${key} not found !`);
        return null;
    }
}

export async function uploadLocalFile(key: string, filedata: Buffer | Readable | Stream): Promise<void> {
    try {
        const buffer = await getBuffer(filedata);
        const previousFolders = key.split('/').slice(0, -1).join('/');
        const directory = path.join(temporaryDirectory, previousFolders);
        await fs.mkdirs(directory);
        await fs.writeFile(getFilePath(key), buffer);
    } catch (e) {
        console.error(e);
    }
}

export async function deleteLocalFile(key: string): Promise<void> {
    try {
        await fs.remove(getFilePath(key));
    } catch (e) {
        console.error(e);
    }
}

export async function listLocalFiles(prefix: string): Promise<string[]> {
    try {
        const files: string[] = [];
        const walkDirectory = async (dir: string, currentPath = '') => {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = currentPath ? path.join(currentPath, entry.name) : entry.name;
                if (entry.isDirectory()) {
                    await walkDirectory(fullPath, relativePath);
                } else if (entry.isFile() && relativePath.startsWith(prefix)) {
                    files.push(relativePath);
                }
            }
        };
        await walkDirectory(temporaryDirectory);
        return files;
    } catch (e) {
        console.error(e);
        return [];
    }
}
