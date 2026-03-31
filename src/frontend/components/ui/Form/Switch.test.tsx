import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Switch } from './Switch';

describe('Switch', () => {
    it('renders the label associated to the switch and reflects the checked state', () => {
        render(<Switch id="newsletter" label="Newsletter" isChecked onChange={() => undefined} />);

        const switchElement = screen.getByRole('switch', { name: 'Newsletter' });

        expect(switchElement).toHaveAttribute('id', 'newsletter');
        expect(switchElement).toHaveAttribute('aria-checked', 'true');
    });

    it('calls onChange when toggled', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(<Switch label="Notifications" isChecked={false} onChange={onChange} />);

        await user.click(screen.getByRole('switch', { name: 'Notifications' }));

        expect(onChange).toHaveBeenCalledWith(true);
    });
});
