import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CountrySelect } from './CountrySelect';

describe('CountrySelect', () => {
    it('shows only filtered countries and forwards the selected country', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(<CountrySelect value="FR" onChange={onChange} filter={(country) => ['FR', 'BR'].includes(country)} />);

        await user.click(screen.getByRole('combobox'));

        expect(screen.getByRole('option', { name: /France/ })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /Brésil/ })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: /Afghanistan/ })).not.toBeInTheDocument();

        await user.click(screen.getByRole('option', { name: /Brésil/ }));

        expect(onChange).toHaveBeenCalledWith('BR');
    });
});
