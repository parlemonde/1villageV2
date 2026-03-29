import { render, screen } from '@testing-library/react';

import { Field } from './Field';

describe('Field', () => {
    it('renders the label, input and helper text together', () => {
        render(<Field name="classroom" label="Classroom" helperText="Pick the classroom" input={<input id="classroom" />} />);

        const label = screen.getByText('Classroom');
        const input = screen.getByRole('textbox');

        expect(label).toBeInTheDocument();
        expect(label).toHaveAttribute('for', 'classroom');
        expect(input).toBeInTheDocument();
        expect(screen.getByText('Pick the classroom')).toBeInTheDocument();
    });

    it('shows the required marker when requested', () => {
        render(<Field name="teacher" label="Teacher" isRequired input={<input id="teacher" />} />);

        expect(screen.getByText('*')).toBeInTheDocument();
    });
});
