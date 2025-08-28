import { DropdownMenu } from 'radix-ui';

import styles from './dropdown.module.css';
import type { Size } from '../css-styles';
import { SIZES } from '../css-styles';

interface DropdownProps {
    /** The trigger element to open the dropdown. It should be a button. */
    trigger: React.ReactNode;
    /** The offset of the dropdown between the trigger and the content. */
    offset?: Size;
    /** The side of the dropdown. */
    side?: DropdownMenu.DropdownMenuContentProps['side'];
    /** The alignment of the dropdown. */
    align?: DropdownMenu.DropdownMenuContentProps['align'];
}

export const Dropdown = ({ trigger, offset = 'sm', children, side = 'bottom', align = 'center' }: React.PropsWithChildren<DropdownProps>) => {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    onCloseAutoFocus={(event) => {
                        event.preventDefault();
                    }}
                    className={styles.dropdownMenuContent}
                    sideOffset={SIZES[offset]}
                    collisionPadding={16}
                    side={side}
                    align={align}
                >
                    {children}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};
