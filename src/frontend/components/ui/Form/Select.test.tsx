import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Select } from './Select';

describe('Select', () => {
    it('renders the placeholder and lets the user choose an option', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(
            <Select
                placeholder="Choose a country"
                onChange={onChange}
                options={[
                    { label: 'France', value: 'FR' },
                    { label: 'Brazil', value: 'BR' },
                ]}
            />,
        );

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: 'France' }));

        expect(onChange).toHaveBeenCalledWith('FR');
    });

    it('clears the selected value when the cross is clicked', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        const { container } = render(
            <Select
                value="FR"
                hasCross
                onChange={onChange}
                options={[
                    { label: 'France', value: 'FR' },
                    { label: 'Brazil', value: 'BR' },
                ]}
            />,
        );

        const clearIcon = container.querySelector('.clearIcon');
        if (!(clearIcon instanceof SVGElement)) {
            throw new Error('Clear icon not found');
        }

        await user.click(clearIcon);

        expect(onChange).toHaveBeenCalledWith('');
    });
});
