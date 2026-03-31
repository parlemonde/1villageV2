import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Input } from './Input';

describe('Input', () => {
    it('renders an icon adornment and clears the invalid state on change', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(<Input iconAdornment={<span>icon</span>} iconAdornmentProps={{ position: 'right' }} onChange={onChange} />);

        const input = screen.getByRole('textbox');

        expect(screen.getByText('icon')).toBeInTheDocument();

        act(() => {
            input.dispatchEvent(new Event('invalid', { cancelable: true }));
        });

        expect(input).toHaveClass('hasError');

        await user.type(input, 'abc');

        expect(onChange).toHaveBeenCalled();
        expect(input).not.toHaveClass('hasError');
    });
});
