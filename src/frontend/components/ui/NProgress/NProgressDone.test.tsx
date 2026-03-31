import { render, waitFor } from '@testing-library/react';

import { NProgressDone } from './NProgressDone';
import { mockUsePathname, mockUseSearchParams } from '../../../../test/next.mocks';
import { mockNProgressDone } from '../../../../test/nprogress.mocks';

describe('NProgressDone', () => {
    it('calls NProgress.done on mount and when navigation values change', async () => {
        mockUsePathname.mockReturnValue('/home');
        mockUseSearchParams.mockReturnValue(new URLSearchParams('a=1'));

        const { rerender } = render(<NProgressDone />);

        await waitFor(() => {
            expect(mockNProgressDone).toHaveBeenCalledTimes(1);
        });

        mockUsePathname.mockReturnValue('/village');
        mockUseSearchParams.mockReturnValue(new URLSearchParams('a=2'));

        rerender(<NProgressDone />);

        await waitFor(() => {
            expect(mockNProgressDone).toHaveBeenCalledTimes(2);
        });
    });
});
