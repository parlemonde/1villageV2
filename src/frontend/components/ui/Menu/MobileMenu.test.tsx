import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MobileMenu } from './MobileMenu';

describe('MobileMenu', () => {
    it('renders links and buttons from menu items', async () => {
        const user = userEvent.setup();
        const onClick = jest.fn();

        render(
            <MobileMenu
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Refresh', onClick },
                ]}
            />,
        );

        expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');

        await user.click(screen.getByRole('button', { name: 'Refresh' }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
