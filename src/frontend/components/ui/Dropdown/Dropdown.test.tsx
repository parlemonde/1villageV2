import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Dropdown } from './Dropdown';

describe('Dropdown', () => {
    it('renders the trigger and opens the content', async () => {
        const user = userEvent.setup();

        render(
            <Dropdown trigger={<button type="button">Open</button>} offset="lg" side="top" align="end">
                <span>Menu content</span>
            </Dropdown>,
        );

        await user.click(screen.getByRole('button', { name: 'Open' }));

        expect(await screen.findByText('Menu content')).toBeInTheDocument();
    });
});
