import { jest, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from './Button';

describe('Button', () => {
    it('renders as a native button by default and calls onClick', async () => {
        const user = userEvent.setup();
        const onClick = jest.fn();

        render(<Button label="Save" onClick={onClick} />);

        const button = screen.getByRole('button', { name: 'Save' });

        expect(button).toHaveAttribute('type', 'button');

        await user.click(button);

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('disables the button and swaps the left icon for a loader when loading', () => {
        const { container } = render(<Button label="Save" leftIcon={<span>icon</span>} isLoading />);

        const button = screen.getByRole('button', { name: 'Save' });

        expect(button).toBeDisabled();
        expect(screen.queryByText('icon')).not.toBeInTheDocument();
        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders the local link branch when requested', () => {
        render(<Button as="a" href="/villages/1" label="Open village" />);

        expect(screen.getByRole('link', { name: 'Open village' })).toHaveAttribute('href', '/villages/1');
    });
});
