import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { PageContainer } from './PageContainer';

describe('PageContainer', () => {
    it('renders its title with the requested heading level and children', () => {
        render(
            <PageContainer title="Admin area" titleVariant="h2">
                <p>Child content</p>
            </PageContainer>,
        );

        expect(screen.getByRole('heading', { level: 2, name: 'Admin area' })).toBeInTheDocument();
        expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('does not render a heading when the title is omitted', () => {
        render(
            <PageContainer>
                <p>Only content</p>
            </PageContainer>,
        );

        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
        expect(screen.getByText('Only content')).toBeInTheDocument();
    });
});
