import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { Breadcrumbs } from './Breadcrumbs';

describe('Breadcrumbs', () => {
    it('renders linked and current breadcrumbs with separators', () => {
        const { container } = render(
            <Breadcrumbs breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Village', href: '/village' }, { label: 'Current page' }]} />,
        );

        expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
        expect(screen.getByRole('link', { name: 'Village' })).toHaveAttribute('href', '/village');
        expect(screen.getByText('Current page')).toBeInTheDocument();
        expect(container.querySelectorAll('svg')).toHaveLength(2);
    });
});
