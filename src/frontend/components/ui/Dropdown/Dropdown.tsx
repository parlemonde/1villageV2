import classNames from 'clsx';
import { DropdownMenu } from 'radix-ui';

import styles from './dropdown.module.css';
import type { Size } from '../css-styles';
import { SIZES } from '../css-styles';

interface DropdownProps {
    /** The trigger element to open the dropdown. It should be a button. */
    trigger: React.ReactNode;
    /** The offset of the dropdown between the trigger and the content. */
    offset?: Size | number;
    /** The side of the dropdown. */
    side?: DropdownMenu.DropdownMenuContentProps['side'];
    /** The alignment of the dropdown. */
    align?: DropdownMenu.DropdownMenuContentProps['align'];
    /** Whether to disabled the shadow for the dropdown content. */
    disableShadow?: boolean;
    /** Whether to disable the animation for the dropdown content. */
    disableAnimation?: boolean;
    /** The class name for the dropdown content. */
    contentClassName?: string;
}

export const Dropdown = ({
    trigger,
    offset = 'sm',
    children,
    side = 'bottom',
    align = 'center',
    disableShadow = false,
    disableAnimation = false,
    contentClassName,
}: React.PropsWithChildren<DropdownProps>) => {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    onCloseAutoFocus={(event) => {
                        event.preventDefault();
                    }}
                    className={classNames(
                        styles.dropdownMenuContent,
                        { [styles.hasShadow]: !disableShadow, [styles.hasAnimation]: !disableAnimation },
                        contentClassName,
                    )}
                    sideOffset={typeof offset === 'number' ? offset : SIZES[offset]}
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
