import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockUsePathname = jest.fn();
const mockConfigure = jest.fn();
const mockStart = jest.fn();

let Link: typeof import('./Link').Link;

beforeAll(async () => {
    jest.doMock('next/link', () => {
        const React = jest.requireActual('react') as typeof import('react');
        const MockNextLink = React.forwardRef<
            HTMLAnchorElement,
            React.PropsWithChildren<React.ComponentProps<'a'> & { onNavigate?: (event: Event) => void; prefetch?: boolean }>
        >(({ children, onNavigate, href, prefetch, ...props }, ref) => (
            <a
                {...props}
                ref={ref}
                href={typeof href === 'string' ? href : String(href)}
                data-prefetch={String(prefetch)}
                onClick={(event) => {
                    event.preventDefault();
                    onNavigate?.(new Event('navigate'));
                }}
            >
                {children}
            </a>
        ));
        MockNextLink.displayName = 'MockNextLink';

        return {
            __esModule: true,
            default: MockNextLink,
        };
    });

    jest.doMock('next/navigation', () => ({
        usePathname: mockUsePathname,
    }));

    jest.doMock('nprogress', () => ({
        __esModule: true,
        default: {
            configure: mockConfigure,
            start: mockStart,
        },
    }));

    ({ Link } = await import('./Link'));
});

describe('Link', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('starts nprogress when navigating to another path', async () => {
        const user = userEvent.setup();
        const onNavigate = jest.fn();
        mockUsePathname.mockReturnValue('/current');

        render(
            <Link href="/next" onNavigate={onNavigate}>
                Open
            </Link>,
        );

        const link = screen.getByRole('link', { name: 'Open' });

        expect(link).toHaveAttribute('href', '/next');
        expect(link).toHaveAttribute('data-prefetch', 'false');

        await user.click(link);

        expect(mockConfigure).toHaveBeenCalledWith({ showSpinner: false });
        expect(mockStart).toHaveBeenCalledTimes(1);
        expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    it('does not start nprogress when linking to the current path', async () => {
        const user = userEvent.setup();
        mockUsePathname.mockReturnValue('/current');

        render(<Link href="/current">Open</Link>);

        await user.click(screen.getByRole('link', { name: 'Open' }));

        expect(mockStart).not.toHaveBeenCalled();
    });
});
