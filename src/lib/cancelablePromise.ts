type CancelablePromiseCancelCallback = () => void;
type CancelablePromiseExecutor<T> = (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: unknown) => void,
) => CancelablePromiseCancelCallback | void;

const CANCELABLE_PROMISE_CANCELED_MESSAGE = 'Promise canceled';

export class CancelablePromiseCanceledError extends Error {
    constructor(message = CANCELABLE_PROMISE_CANCELED_MESSAGE) {
        super(message);
        this.name = 'CancelablePromiseCanceledError';
    }
}

export const isCancelablePromiseCanceledError = (error: unknown): error is CancelablePromiseCanceledError =>
    error instanceof CancelablePromiseCanceledError;

export class CancelablePromise<T> extends Promise<T> {
    private _abortController: AbortController;

    static get [Symbol.species]() {
        return Promise;
    }

    static from<T>(factory: (signal: AbortSignal) => T | PromiseLike<T>, abortController = new AbortController()): CancelablePromise<T> {
        return new CancelablePromise<T>((resolve, reject) => {
            Promise.resolve()
                .then(() => factory(abortController.signal))
                .then(resolve, reject);
        }, abortController);
    }

    constructor(executor: CancelablePromiseExecutor<T>, abortController = new AbortController()) {
        super((resolve, reject) => {
            let cancelCallback: CancelablePromiseCancelCallback = () => {};
            let settled = false;

            const cleanup = () => {
                abortController.signal.removeEventListener('abort', onCancel);
            };
            const wrappedResolve = (value: T | PromiseLike<T>) => {
                if (settled) {
                    return;
                }
                settled = true;
                cleanup();
                resolve(value);
            };
            const wrappedReject = (reason?: unknown) => {
                if (settled) {
                    return;
                }
                settled = true;
                cleanup();
                reject(reason);
            };
            const onCancel = () => {
                try {
                    cancelCallback();
                } finally {
                    wrappedReject(new CancelablePromiseCanceledError());
                }
            };

            try {
                const maybeCancelCallback = executor(wrappedResolve, wrappedReject);
                if (maybeCancelCallback !== undefined) {
                    cancelCallback = maybeCancelCallback;
                }
            } catch (error) {
                wrappedReject(error);
                return;
            }

            abortController.signal.addEventListener('abort', onCancel);

            if (abortController.signal.aborted) {
                onCancel();
            }
        });
        this._abortController = abortController;
        // `await` internally calls `.then(...)` and ignores the returned promise.
        // Since this class returns another CancelablePromise from `then`, those
        // internal bridge promises can be aborted without any user-land consumer.
        // A native no-op rejection handler keeps them marked as handled while
        // preserving normal rejection behavior for real callers.
        void Promise.prototype.then.call(this, undefined, () => undefined);
    }

    get signal() {
        return this._abortController.signal;
    }

    then<TResult1 = T, TResult2 = never>(
        onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
        onRejected?: ((reason?: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ): CancelablePromise<TResult1 | TResult2> {
        return new CancelablePromise<TResult1 | TResult2>((resolve, reject) => {
            const chainedPromise = super.then(
                (value): TResult1 | PromiseLike<TResult1> => {
                    if (onFulfilled === undefined || onFulfilled === null) {
                        return value as unknown as TResult1;
                    }

                    return onFulfilled(value);
                },
                (reason): TResult2 | PromiseLike<TResult2> => {
                    if (onRejected === undefined || onRejected === null) {
                        throw reason;
                    }

                    return onRejected(reason);
                },
            );

            void chainedPromise.then(resolve, reject);
        }, this._abortController);
    }

    catch<TResult = never>(onRejected?: ((reason?: unknown) => TResult | PromiseLike<TResult>) | null): CancelablePromise<T | TResult> {
        return this.then(undefined, onRejected);
    }

    finally(onFinally?: (() => void) | null): CancelablePromise<T> {
        if (onFinally === undefined || onFinally === null) {
            return this.then();
        }

        return this.then(
            (value) => Promise.resolve(onFinally()).then(() => value),
            (reason) =>
                Promise.resolve(onFinally()).then(() => {
                    throw reason;
                }),
        );
    }

    cancel() {
        this._abortController.abort();
    }
}
