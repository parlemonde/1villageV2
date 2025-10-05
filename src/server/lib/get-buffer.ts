import type Stream from 'node:stream';
import type { Readable } from 'node:stream';

export function getBuffer(stream: Buffer | Stream | Readable): Promise<Buffer> {
    if (Buffer.isBuffer(stream)) {
        return Promise.resolve(stream);
    }
    return new Promise<Buffer>((resolve, reject) => {
        const _buf = Array<Buffer>();
        stream.on('data', (chunk) => _buf.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(_buf)));
        stream.on('error', (err) => reject(`error converting stream - ${err}`));
    });
}
