import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MultiSelect } from './MultiSelect';

describe('MultiSelect', () => {
    it('shows the selected values and maps the react-select change back to string values', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(
            <MultiSelect
                value={['FR']}
                onChange={onChange}
                options={[
                    { label: 'France', value: 'FR' },
                    { label: 'Brazil', value: 'BR' },
                ]}
            />,
        );

        expect(screen.getByText('France')).toBeInTheDocument();

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByText('Brazil'));

        expect(onChange).toHaveBeenCalledWith(['FR', 'BR']);
    });
});
