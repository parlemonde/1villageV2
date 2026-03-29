import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { BackDrop } from './BackDrop';

describe('BackDrop', () => {
    it('renders its children through the backdrop portal and forwards props', () => {
        render(
            <BackDrop className="custom-backdrop" id="overlay">
                <span>Overlay content</span>
            </BackDrop>,
        );

        const portalRoot = document.body.querySelector('#overlay');
        if (!(portalRoot instanceof HTMLElement)) {
            throw new Error('Backdrop element not found');
        }

        expect(portalRoot).toHaveClass('backdrop');
        expect(portalRoot).toHaveClass('custom-backdrop');
        expect(screen.getByText('Overlay content')).toBeInTheDocument();
    });
});
