import { NextResponse } from 'next/server';

interface ErrorWithStatusAndMessage {
    errorId: string;
    httpStatusCode: number;
}
const isErrorWithStatusAndMessage = (error: unknown): error is ErrorWithStatusAndMessage => {
    return (
        typeof error === 'object' &&
        error !== null &&
        'errorId' in error &&
        typeof error.errorId === 'string' &&
        'httpStatusCode' in error &&
        typeof error.httpStatusCode === 'number'
    );
};

export const getErrorResponse = (error: unknown) => {
    const { errorId, httpStatusCode } = isErrorWithStatusAndMessage(error)
        ? { errorId: error.errorId, httpStatusCode: error.httpStatusCode }
        : { errorId: 'Unknown error', httpStatusCode: 500 };
    return NextResponse.json({ success: false, message: errorId, httpStatusCode }, { status: httpStatusCode });
};
