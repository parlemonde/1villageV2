import { render, screen } from '@testing-library/react';

import { CountryOption } from './CountryOption';

describe('CountryOption', () => {
    it('renders the country flag image and label', () => {
        render(<CountryOption id="FR" value="France" />);

        expect(screen.getByAltText('FR flag')).toBeInTheDocument();
        expect(screen.getByText('France')).toBeInTheDocument();
    });
});
