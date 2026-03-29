import { render, screen } from '@testing-library/react';

import { Loader } from './Loader';

describe('Loader', () => {
    it('renders nothing when loading is false', () => {
        const { container } = render(<Loader isLoading={false} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('renders the backdrop and progress indicator when loading', () => {
        render(<Loader isLoading />);

        const backdrop = document.body.querySelector('.loader');
        if (!(backdrop instanceof HTMLElement)) {
            throw new Error('Loader backdrop not found');
        }

        expect(backdrop).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});
