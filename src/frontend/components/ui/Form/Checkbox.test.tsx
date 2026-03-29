import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
    it('renders the label associated to the checkbox button and reflects the checked state', () => {
        render(<Checkbox name="terms" label="Accept terms" isChecked />);

        const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });

        expect(checkbox).toHaveAttribute('id', 'terms');
        expect(checkbox).toHaveAttribute('aria-checked', 'true');
        expect(checkbox).toHaveAttribute('data-state', 'checked');
        expect(screen.getByLabelText('Accept terms')).toBe(checkbox);
    });

    it('calls onChange with the next checked state', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(<Checkbox name="updates" label="Receive updates" isChecked={false} onChange={onChange} />);

        await user.click(screen.getByRole('checkbox', { name: 'Receive updates' }));

        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('disables interaction when requested', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(<Checkbox name="policy" label="Privacy policy" isChecked={false} isDisabled onChange={onChange} />);

        const checkbox = screen.getByRole('checkbox', { name: 'Privacy policy' });

        expect(checkbox).toBeDisabled();

        await user.click(checkbox);

        expect(onChange).not.toHaveBeenCalled();
    });
});
