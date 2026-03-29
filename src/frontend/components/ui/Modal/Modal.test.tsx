import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Modal } from './Modal';

describe('Modal', () => {
    it('renders title, content and footer actions', async () => {
        const user = userEvent.setup();
        const onClose = jest.fn();
        const onConfirm = jest.fn<void, []>();

        render(
            <Modal isOpen onClose={onClose} onConfirm={onConfirm} title="Confirm action">
                <p>Body content</p>
            </Modal>,
        );

        expect(screen.getByText('Confirm action')).toBeInTheDocument();
        expect(screen.getByText('Body content')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Annuler' }));
        await user.click(screen.getByRole('button', { name: 'Valider' }));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('renders the loading indicator when requested', () => {
        render(
            <Modal isOpen onClose={() => undefined} isLoading title="Loading">
                <p>Body content</p>
            </Modal>,
        );

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});
