import { render } from '@testing-library/react';

import { CircularProgress } from './CircularProgress';

describe('CircularProgress', () => {
    it('renders the spinner markup with the requested size', () => {
        const { container } = render(<CircularProgress size={28} />);

        const progressRoot = container.firstElementChild;
        const svg = container.querySelector('svg');

        expect(progressRoot).toBeInTheDocument();
        expect(progressRoot).toHaveStyle({ width: '28px', height: '28px' });
        expect(svg).toBeInTheDocument();
    });
});
