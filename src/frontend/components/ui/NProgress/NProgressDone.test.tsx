import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, waitFor } from '@testing-library/react';

const mockUsePathname = jest.fn();
const mockUseSearchParams = jest.fn();
const mockDone = jest.fn();

let NProgressDone: typeof import('./NProgressDone').NProgressDone;

beforeAll(async () => {
    jest.doMock('next/navigation', () => ({
        usePathname: mockUsePathname,
        useSearchParams: mockUseSearchParams,
    }));

    jest.doMock('nprogress', () => ({
        __esModule: true,
        default: {
            done: mockDone,
        },
    }));

    ({ NProgressDone } = await import('./NProgressDone'));
});

describe('NProgressDone', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls NProgress.done on mount and when navigation values change', async () => {
        mockUsePathname.mockReturnValue('/home');
        mockUseSearchParams.mockReturnValue(new URLSearchParams('a=1'));

        const { rerender } = render(<NProgressDone />);

        await waitFor(() => {
            expect(mockDone).toHaveBeenCalledTimes(1);
        });

        mockUsePathname.mockReturnValue('/village');
        mockUseSearchParams.mockReturnValue(new URLSearchParams('a=2'));

        rerender(<NProgressDone />);

        await waitFor(() => {
            expect(mockDone).toHaveBeenCalledTimes(2);
        });
    });
});
