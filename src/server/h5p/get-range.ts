import { H5pError } from '@lumieducation/h5p-server';

export const getRange = (size: number, rangeHeader: string): { start: number; end: number } => {
    const [startStr, endStr] = rangeHeader.replace(/bytes=/, '').split('-');
    let start = parseInt(startStr, 10);
    let end = endStr ? parseInt(endStr, 10) : size - 1;
    if (!isNaN(start) && isNaN(end)) {
        end = size - 1;
    }
    if (isNaN(start) && !isNaN(end)) {
        start = size - end;
        end = size - 1;
    }
    // Handle unavailable range request
    if (start >= size || end >= size) {
        throw new H5pError('range-not-satisfiable', undefined, 416);
    }
    return { start, end };
};
