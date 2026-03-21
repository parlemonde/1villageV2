import { CancelablePromise, CancelablePromiseCanceledError } from '@lib/cancelablePromise';
import type Stream from 'node:stream';
import type { Readable } from 'node:stream';

export function getBuffer(stream: Buffer | Stream | Readable, abortController?: AbortController): CancelablePromise<Buffer> {
    if (Buffer.isBuffer(stream)) {
        return CancelablePromise.from(() => stream, abortController);
    }

    return new CancelablePromise<Buffer>((resolve, reject) => {
        const _buf = Array<Buffer>();
        const readable = stream as Readable;
        const onData = (chunk: Buffer) => _buf.push(chunk);
        const onEnd = () => {
            cleanup();
            resolve(Buffer.concat(_buf));
        };
        const onError = (err: Error) => {
            cleanup();
            reject(`error converting stream - ${err}`);
        };
        const cleanup = () => {
            readable.off('data', onData);
            readable.off('end', onEnd);
            readable.off('error', onError);
        };

        readable.on('data', onData);
        readable.on('end', onEnd);
        readable.on('error', onError);

        return () => {
            cleanup();
            readable.destroy(new CancelablePromiseCanceledError());
        };
    }, abortController);
}
