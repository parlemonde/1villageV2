import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TextArea } from './TextArea';

describe('TextArea', () => {
    it('shows a floating label on focus and restores the placeholder on blur', async () => {
        const user = userEvent.setup();

        render(<TextArea placeholder="Your message" value="" onChange={() => undefined} />);

        const textarea = screen.getByRole('textbox');

        expect(textarea).toHaveAttribute('placeholder', 'Your message');
        expect(screen.queryByText('Your message')).not.toBeInTheDocument();

        await user.click(textarea);

        expect(textarea).toHaveAttribute('placeholder', '');
        expect(screen.getByText('Your message')).toBeInTheDocument();

        await user.tab();

        expect(textarea).toHaveAttribute('placeholder', 'Your message');
        expect(screen.queryByText('Your message')).not.toBeInTheDocument();
    });

    it('clears the invalid state after the user changes the value', async () => {
        const user = userEvent.setup();

        render(<TextArea placeholder="Comment" value="" onChange={() => undefined} />);

        const textarea = screen.getByRole('textbox');

        act(() => {
            textarea.dispatchEvent(new Event('invalid', { cancelable: true }));
        });

        expect(textarea).toHaveClass('hasError');

        await user.type(textarea, 'Hello');

        expect(textarea).not.toHaveClass('hasError');
    });
});
