import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('@frontend/components/ui/Link', () => ({
    Link: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a>,
}));

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
