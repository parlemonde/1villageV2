interface ServerActionError {
    message: string;
}

export interface ServerActionErrorResult {
    error?: ServerActionError;
}

interface ServerActionResponseWithResult<T = void> {
    error?: ServerActionError;
    data?: T;
}

export type ServerActionResponse<T = void> = T extends void ? ServerActionErrorResult : ServerActionResponseWithResult<T>;
