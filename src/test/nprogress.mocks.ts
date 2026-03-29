import { beforeEach, jest } from '@jest/globals';

export const mockNProgressConfigure = jest.fn();
export const mockNProgressStart = jest.fn();
export const mockNProgressDone = jest.fn();

jest.mock('nprogress', () => ({
    __esModule: true,
    default: {
        configure: mockNProgressConfigure,
        start: mockNProgressStart,
        done: mockNProgressDone,
    },
}));

beforeEach(() => {
    mockNProgressConfigure.mockReset();
    mockNProgressStart.mockReset();
    mockNProgressDone.mockReset();
});
