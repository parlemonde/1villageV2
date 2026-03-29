import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RadioGroup } from './RadioGroup';

describe('RadioGroup', () => {
    const options = [
        { label: 'France', value: 'fr' },
        { label: 'Brazil', value: 'br' },
    ];

    it('renders all options and reflects the selected value', () => {
        render(<RadioGroup options={options} value="br" />);

        expect(screen.getByRole('radio', { name: 'France' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Brazil' })).toHaveAttribute('data-state', 'checked');
    });

    it('calls onChange with the chosen option', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(<RadioGroup options={options} value="fr" onChange={onChange} />);

        await user.click(screen.getByRole('radio', { name: 'Brazil' }));

        expect(onChange).toHaveBeenCalledWith('br');
    });

    it('keeps rendering when readonly styling is enabled', () => {
        const { container } = render(<RadioGroup options={options} value="fr" readonly />);

        expect(screen.getByRole('radio', { name: 'France' })).toBeInTheDocument();
        expect(container.firstElementChild).toHaveClass('readonly');
    });
});
