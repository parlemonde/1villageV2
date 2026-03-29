import { beforeEach, jest } from '@jest/globals';

export const mockUsePathname = jest.fn<() => string>(() => '/');
export const mockUseSearchParams = jest.fn<() => URLSearchParams>(() => new URLSearchParams());

jest.mock('next/navigation', () => ({
    usePathname: mockUsePathname,
    useSearchParams: mockUseSearchParams,
}));

jest.mock('next/link', () => {
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

beforeEach(() => {
    mockUsePathname.mockReset();
    mockUseSearchParams.mockReset();
    mockUsePathname.mockReturnValue('/');
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
});
