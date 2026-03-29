import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let CountrySelect: typeof import('./CountrySelect').CountrySelect;

beforeAll(async () => {
    jest.doMock('@frontend/svg/arrowDown.svg', () => ({
        __esModule: true,
        default: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />,
    }));

    jest.doMock('@radix-ui/react-icons', () => ({
        Cross2Icon: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />,
    }));

    jest.doMock('radix-ui', () => {
        const React = jest.requireActual('react') as typeof import('react');

        type SelectContextValue = {
            onValueChange?: (value: string) => void;
            onOpenChange?: (isOpen: boolean) => void;
            open?: boolean;
        };

        const SelectContext = React.createContext<SelectContextValue>({});

        const Root = ({ children, onValueChange, onOpenChange, open }: React.PropsWithChildren<SelectContextValue>) => (
            <SelectContext.Provider value={{ onValueChange, onOpenChange, open }}>{children}</SelectContext.Provider>
        );

        const Trigger = ({ children, ...props }: React.PropsWithChildren<React.ComponentProps<'button'>>) => {
            const { onOpenChange, open } = React.useContext(SelectContext);
            return (
                <button
                    type="button"
                    role="combobox"
                    aria-controls="select-content"
                    aria-expanded={Boolean(open)}
                    onClick={() => onOpenChange?.(!open)}
                    {...props}
                >
                    {children}
                </button>
            );
        };

        const Value = ({ placeholder }: { placeholder?: React.ReactNode }) => <>{placeholder}</>;

        const Portal = ({ children }: React.PropsWithChildren) => <>{children}</>;
        const Content = ({ children, ...props }: React.PropsWithChildren<React.ComponentProps<'div'>>) => <div {...props}>{children}</div>;
        const Viewport = ({ children, ...props }: React.PropsWithChildren<React.ComponentProps<'div'>>) => <div {...props}>{children}</div>;
        const Item = ({ children, value, ...props }: React.PropsWithChildren<React.ComponentProps<'div'> & { value: string }>) => {
            const { onValueChange, onOpenChange } = React.useContext(SelectContext);
            return (
                <div
                    role="option"
                    aria-selected={false}
                    onClick={() => {
                        onValueChange?.(value);
                        onOpenChange?.(false);
                    }}
                    {...props}
                >
                    {children}
                </div>
            );
        };
        const ItemText = ({ children }: React.PropsWithChildren) => <>{children}</>;

        return {
            Select: {
                Root,
                Trigger,
                Value,
                Portal,
                Content,
                Viewport,
                Item,
                ItemText,
            },
            ScrollArea: {
                Root: ({ children, ...props }: React.PropsWithChildren<React.ComponentProps<'div'>>) => <div {...props}>{children}</div>,
                Viewport: ({ children, ...props }: React.PropsWithChildren<React.ComponentProps<'div'>>) => <div {...props}>{children}</div>,
                Scrollbar: ({ children, ...props }: React.PropsWithChildren<React.ComponentProps<'div'>>) => <div {...props}>{children}</div>,
                Thumb: (props: React.ComponentProps<'div'>) => <div {...props} />,
            },
        };
    });

    ({ CountrySelect } = await import('./CountrySelect'));
});

describe('CountrySelect', () => {
    it('shows only filtered countries and forwards the selected country', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(<CountrySelect value="FR" onChange={onChange} filter={(country) => ['FR', 'BR'].includes(country)} />);

        await user.click(screen.getByRole('combobox'));

        expect(screen.getByRole('option', { name: /France/ })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /Brésil/ })).toBeInTheDocument();
        expect(screen.queryByRole('option', { name: /Afghanistan/ })).not.toBeInTheDocument();

        await user.click(screen.getByRole('option', { name: /Brésil/ }));

        expect(onChange).toHaveBeenCalledWith('BR');
    });
});
