import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

global.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;

let Tooltip: typeof import('./Tooltip').Tooltip;

beforeAll(async () => {
    jest.doMock('radix-ui', () => ({
        Tooltip: {
            Root: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
            Trigger: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
            Portal: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
            Content: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => <div className={className}>{children}</div>,
            Arrow: () => <div data-testid="tooltip-arrow" />,
        },
    }));

    ({ Tooltip } = await import('./Tooltip'));
});

describe('Tooltip', () => {
    it('returns only the children when disabled', () => {
        render(
            <Tooltip isEnabled={false} content="More info">
                <button type="button">Trigger</button>
            </Tooltip>,
        );

        expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
        expect(screen.queryByText('More info')).not.toBeInTheDocument();
    });

    it('renders the content and arrow when enabled', () => {
        render(
            <Tooltip content="More info" hasArrow>
                <button type="button">Trigger</button>
            </Tooltip>,
        );

        expect(screen.getByText('More info')).toBeInTheDocument();
        expect(screen.getByTestId('tooltip-arrow')).toBeInTheDocument();
    });
});
