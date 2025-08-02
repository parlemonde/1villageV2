'use client';

import classNames from 'clsx';
import { Select as RadixSelect, ScrollArea } from 'radix-ui';

import styles from './select.module.css';
import { getMarginAndPaddingStyle, type MarginProps } from '../css-styles';
import ArrowDownIcon from '@/svg/arrowDown.svg';

interface SelectProps extends MarginProps {
    defaultValue?: string;
    value?: string;
    onChange?: (value: string) => void;
    options: { label: string; value: string }[];
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary';
    isFullWidth?: boolean;
    placeholder?: string;
}

export const Select = ({
    defaultValue,
    value,
    onChange,
    options,
    size = 'md',
    color = 'primary',
    isFullWidth = false,
    placeholder = 'Choisir une option',
    ...marginProps
}: SelectProps) => {
    return (
        <RadixSelect.Root defaultValue={defaultValue} value={value} onValueChange={onChange}>
            <RadixSelect.Trigger
                className={classNames(styles.SelectTrigger, styles[`size--${size}`], styles[`color--${color}`], {
                    [styles[`isFullWidth`]]: isFullWidth,
                })}
                aria-label="Food"
                style={getMarginAndPaddingStyle(marginProps)}
            >
                <span className={styles.SelectValue}>
                    <RadixSelect.Value placeholder={placeholder} />
                </span>
                <ArrowDownIcon className={styles.SelectIcon} />
            </RadixSelect.Trigger>
            <RadixSelect.Portal>
                <RadixSelect.Content position="popper" side="bottom" align="start" sideOffset={0} className={styles.SelectContent}>
                    <ScrollArea.Root className={styles.ScrollAreaRoot} type="auto">
                        <RadixSelect.Viewport asChild>
                            <ScrollArea.Viewport
                                className={styles.SelectViewport}
                                style={{
                                    overflowY: undefined, // Needed to avoid a warning...
                                }}
                            >
                                {options.map((option) => (
                                    <RadixSelect.Item key={option.value} value={option.value} className={styles.SelectItem}>
                                        <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                                    </RadixSelect.Item>
                                ))}
                            </ScrollArea.Viewport>
                        </RadixSelect.Viewport>
                        <ScrollArea.Scrollbar className={styles.SelectScrollbar} orientation="vertical">
                            <ScrollArea.Thumb className={styles.SelectThumb} />
                        </ScrollArea.Scrollbar>
                    </ScrollArea.Root>
                </RadixSelect.Content>
            </RadixSelect.Portal>
        </RadixSelect.Root>
    );
};
