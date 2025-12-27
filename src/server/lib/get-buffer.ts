import type Stream from 'node:stream';
import type { Readable } from 'node:stream';

export function getBuffer(stream: Buffer | Stream | Readable): Promise<Buffer> {
    if (Buffer.isBuffer(stream)) {
        return Promise.resolve(stream);
    }
    return new Promise<Buffer>((resolve, reject) => {
        const _buf = Array<Buffer>();
        const readable = stream as Readable;
        readable.on('data', (chunk: Buffer) => _buf.push(chunk));
        readable.on('end', () => resolve(Buffer.concat(_buf)));
        readable.on('error', (err: Error) => reject(`error converting stream - ${err}`));
    });
}
