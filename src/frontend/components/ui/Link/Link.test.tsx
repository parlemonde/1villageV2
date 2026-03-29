import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Link } from './Link';
import { mockUsePathname } from '../../../../test/next.mocks';
import { mockNProgressConfigure, mockNProgressStart } from '../../../../test/nprogress.mocks';

describe('Link', () => {
    it('starts nprogress when navigating to another path', async () => {
        const user = userEvent.setup();
        const onNavigate = jest.fn();
        mockUsePathname.mockReturnValue('/current');

        render(
            <Link href="/next" onNavigate={onNavigate}>
                Open
            </Link>,
        );

        const link = screen.getByRole('link', { name: 'Open' });

        expect(link).toHaveAttribute('href', '/next');
        expect(link).toHaveAttribute('data-prefetch', 'false');

        await user.click(link);

        expect(mockNProgressConfigure).toHaveBeenCalledWith({ showSpinner: false });
        expect(mockNProgressStart).toHaveBeenCalledTimes(1);
        expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    it('does not start nprogress when linking to the current path', async () => {
        const user = userEvent.setup();
        mockUsePathname.mockReturnValue('/current');

        render(<Link href="/current">Open</Link>);

        await user.click(screen.getByRole('link', { name: 'Open' }));

        expect(mockNProgressStart).not.toHaveBeenCalled();
    });
});
