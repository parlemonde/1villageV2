import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Menu } from './Menu';

describe('Menu', () => {
    it('renders links and buttons from menu items', async () => {
        const user = userEvent.setup();
        const onClick = jest.fn();

        render(
            <Menu
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
