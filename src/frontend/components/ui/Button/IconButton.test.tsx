import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { IconButton } from './IconButton';

const TestIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => <svg ref={ref} data-testid="icon" {...props} />);
TestIcon.displayName = 'TestIcon';

describe('IconButton', () => {
    it('renders the passed icon with the size-derived dimensions', () => {
        render(<IconButton icon={TestIcon} size="lg" aria-label="Open menu" />);

        const icon = screen.getByTestId('icon');

        expect(icon).toHaveAttribute('width', '22');
        expect(icon).toHaveAttribute('height', '22');
    });

    it('delegates click behavior through Button', async () => {
        const user = userEvent.setup();
        const onClick = jest.fn();

        render(<IconButton icon={TestIcon} aria-label="Open menu" onClick={onClick} />);

        await user.click(screen.getByRole('button', { name: 'Open menu' }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
