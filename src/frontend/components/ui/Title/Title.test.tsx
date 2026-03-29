import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { Title } from './Title';

describe('Title', () => {
    it('renders the requested heading level with its content and id', () => {
        render(
            <Title id="main-title" variant="h2">
                Village title
            </Title>,
        );

        const heading = screen.getByRole('heading', { level: 2, name: 'Village title' });

        expect(heading).toBeInTheDocument();
        expect(heading).toHaveAttribute('id', 'main-title');
    });

    it('does not add a color class when color is inherit', () => {
        render(<Title color="inherit">Inherited title</Title>);

        const heading = screen.getByRole('heading', { level: 1, name: 'Inherited title' });

        expect(heading).not.toHaveClass('color-primary');
        expect(heading).not.toHaveClass('color-secondary');
    });
});
