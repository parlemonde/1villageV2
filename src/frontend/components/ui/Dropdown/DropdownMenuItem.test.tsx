import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Dropdown } from './Dropdown';
import { DropdownMenuItem } from './DropdownMenuItem';

const TestIcon = ({ className }: { className?: string }) => <svg data-testid="menu-item-icon" className={className} />;

const renderInDropdown = (children: React.ReactNode) => render(<Dropdown trigger={<button type="button">Open</button>}>{children}</Dropdown>);

describe('DropdownMenuItem', () => {
    it('renders the linked variant with its icon', async () => {
        const user = userEvent.setup();

        renderInDropdown(<DropdownMenuItem label="Open profile" href="/profile" icon={TestIcon} />);

        await user.click(screen.getByRole('button', { name: 'Open' }));

        expect(screen.getByRole('menuitem', { name: 'Open profile' })).toHaveAttribute('href', '/profile');
        expect(screen.getByTestId('menu-item-icon')).toBeInTheDocument();
    });

    it('calls onClick for the button variant', async () => {
        const user = userEvent.setup();
        const onClick = jest.fn();

        renderInDropdown(<DropdownMenuItem label="Delete" onClick={onClick} />);

        await user.click(screen.getByRole('button', { name: 'Open' }));
        await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
