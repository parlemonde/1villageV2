import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Tabs } from './Tabs';

describe('Tabs', () => {
    it('renders all tab triggers and reflects the controlled value', () => {
        render(
            <Tabs
                tabs={[
                    { id: 'details', title: 'Details' },
                    { id: 'comments', title: 'Comments' },
                ]}
                value="comments"
            />,
        );

        expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Comments' })).toHaveAttribute('data-state', 'active');
    });

    it('calls onChange with the selected tab id', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(
            <Tabs
                tabs={[
                    { id: 'details', title: 'Details' },
                    { id: 'comments', title: 'Comments' },
                ]}
                value="details"
                onChange={onChange}
            />,
        );

        await user.click(screen.getByRole('tab', { name: 'Comments' }));

        expect(onChange).toHaveBeenCalledWith('comments');
    });
});
