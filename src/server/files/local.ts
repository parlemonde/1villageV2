import fs from 'fs-extra';
import mime from 'mime-types';
import path from 'node:path';
import type { Readable } from 'node:stream';

import type { FileData } from './files.types';

const temporaryDirectory = process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ? '/tmp' : path.join(process.cwd(), 'tmp');
const getFilePath = (fileUrl: string) => path.join(temporaryDirectory, fileUrl);

export async function getLocalFileData(key: string): Promise<FileData | null> {
    try {
        const stats = fs.statSync(getFilePath(key));
        return {
            AcceptRanges: 'none',
            ContentLength: stats.size,
            ContentType: mime.lookup(key) || '',
            LastModified: stats.mtime,
        };
    } catch {
        console.error(`File ${key} not found !`);
        return null;
    }
}

export async function getLocalFile(key: string): Promise<Readable | null> {
    try {
        return fs.createReadStream(getFilePath(key));
    } catch {
        console.error(`File ${key} not found !`);
        return null;
    }
}

export async function uploadLocalFile(key: string, filedata: Buffer): Promise<void> {
    try {
        const previousFolders = key.split('/').slice(0, -1).join('/');
        const directory = path.join(temporaryDirectory, previousFolders);
        await fs.mkdirs(directory);
        await fs.writeFile(getFilePath(key), filedata);
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
