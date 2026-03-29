import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Steps } from './Steps';

describe('Steps', () => {
    it('renders every step and forwards navigation callbacks with the href', async () => {
        const user = userEvent.setup();
        const onNavigateToLink = jest.fn();

        render(
            <Steps
                activeStep={2}
                onNavigateToLink={onNavigateToLink}
                steps={[
                    { label: 'Draft', href: '/draft', status: 'success' },
                    { label: 'Publish', href: '/publish' },
                ]}
            />,
        );

        expect(screen.getByRole('link', { name: /Draft/ })).toHaveAttribute('href', '/draft');
        expect(screen.getByRole('link', { name: /Publish/ })).toHaveAttribute('href', '/publish');

        await user.click(screen.getByRole('link', { name: /Publish/ }));

        expect(onNavigateToLink).toHaveBeenCalledWith(expect.any(Object), '/publish');
    });
});
