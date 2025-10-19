interface SingleBytesRange {
    start: number;
    end: number;
}

const isSingleBytesRange = (header: string) => {
    return /^bytes=\d*-\d*$/.test(header);
};

export const getSingleBytesRange = (size: number, rangeHeader?: string | null): SingleBytesRange | null => {
    if (!rangeHeader || !isSingleBytesRange(rangeHeader)) {
        return null;
    }
    let [start, end] = rangeHeader
        .replace(/bytes=/, '')
        .split('-')
        .map((value) => parseInt(value, 10));
    if (!Number.isSafeInteger(start) || start < 0 || start > size - 1) {
        start = 0;
    }
    if (!Number.isSafeInteger(end) || end < 0 || end > size - 1 || start > end) {
        end = size - 1;
    }
    return { start, end };
};
