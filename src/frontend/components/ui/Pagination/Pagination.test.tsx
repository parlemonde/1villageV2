import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Pagination } from './Pagination';

describe('Pagination', () => {
    it('renders nothing when all items fit on one page', () => {
        const { container } = render(<Pagination totalItems={10} itemsPerPage={10} currentPage={1} onPageChange={() => undefined} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('disables the previous button on the first page and the next button on the last page', () => {
        const { rerender } = render(<Pagination totalItems={50} itemsPerPage={10} currentPage={1} onPageChange={() => undefined} />);

        let buttons = screen.getAllByRole('button');

        expect(buttons[0]).toBeDisabled();
        expect(buttons[buttons.length - 1]).not.toBeDisabled();

        rerender(<Pagination totalItems={50} itemsPerPage={10} currentPage={5} onPageChange={() => undefined} />);

        buttons = screen.getAllByRole('button');

        expect(buttons[0]).not.toBeDisabled();
        expect(buttons[buttons.length - 1]).toBeDisabled();
    });

    it('renders the current page and calls onPageChange for previous, next and direct page buttons', async () => {
        const user = userEvent.setup();
        const onPageChange = jest.fn();

        render(<Pagination totalItems={100} itemsPerPage={10} currentPage={5} onPageChange={onPageChange} />);

        expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();

        const buttons = screen.getAllByRole('button');

        await user.click(buttons[0]);
        await user.click(screen.getByRole('button', { name: '1' }));
        await user.click(screen.getByRole('button', { name: '6' }));
        await user.click(buttons[buttons.length - 1]);

        expect(onPageChange).toHaveBeenNthCalledWith(1, 4);
        expect(onPageChange).toHaveBeenNthCalledWith(2, 1);
        expect(onPageChange).toHaveBeenNthCalledWith(3, 6);
        expect(onPageChange).toHaveBeenNthCalledWith(4, 6);
    });
});
