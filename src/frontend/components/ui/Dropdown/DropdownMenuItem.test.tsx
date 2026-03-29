import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropdownMenu } from 'radix-ui';

jest.mock('@frontend/components/ui/Link', () => ({
    Link: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a>,
}));

import { DropdownMenuItem } from './DropdownMenuItem';

const TestIcon = ({ className }: { className?: string }) => <svg data-testid="menu-item-icon" className={className} />;

const renderInDropdown = (children: React.ReactNode) =>
    render(
        <DropdownMenu.Root open>
            <DropdownMenu.Content>{children}</DropdownMenu.Content>
        </DropdownMenu.Root>,
    );

describe('DropdownMenuItem', () => {
    it('renders the linked variant with its icon', () => {
        renderInDropdown(<DropdownMenuItem label="Open profile" href="/profile" icon={TestIcon} />);

        expect(screen.getByRole('menuitem', { name: 'Open profile' })).toHaveAttribute('href', '/profile');
        expect(screen.getByTestId('menu-item-icon')).toBeInTheDocument();
    });

    it('calls onClick for the button variant', async () => {
        const user = userEvent.setup();
        const onClick = jest.fn();

        renderInDropdown(<DropdownMenuItem label="Delete" onClick={onClick} />);

        await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
