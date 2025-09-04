import ToolbarColorIcon from '@frontend/svg/toolbarColorIcon.svg';
import { Popover, Toolbar as RadixToolbar } from 'radix-ui';

import styles from './color-button.module.css';

const COLORS = [
    'var(--font-color)',
    'rgb(128,203,196)',
    'rgb(44,130,201)',
    'rgb(147,101,184)',
    'rgb(65,168,95)',
    'rgb(0,168,133)',
    'rgb(61,142,185)',
    'rgb(41,105,176)',
    'rgb(76,62,217)',
    'rgb(163, 143, 132)',
    'rgb(247,218,100)',
    'rgb(251,160,38)',
    'rgb(243,121,52)',
    'rgb(235,107,86)',
    'rgb(209,72,65)',
    'rgb(184,49,47)',
];

interface ColorButtonProps {
    selectionColor: string;
    className?: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    setColor: (color: string) => void;
}

export const ColorButton = ({ selectionColor, className, isOpen, setIsOpen, setColor }: ColorButtonProps) => {
    return (
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger asChild>
                <RadixToolbar.Button className={className} style={{ color: selectionColor }}>
                    <ToolbarColorIcon width={24} height={24} />
                </RadixToolbar.Button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content className={styles.popoverContent} sideOffset={8}>
                    {COLORS.map((color) => (
                        <button
                            className={styles.popoverColorButton}
                            style={{ backgroundColor: color }}
                            key={color}
                            onClick={() => {
                                setColor(color);
                                setIsOpen(false);
                            }}
                        ></button>
                    ))}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};
