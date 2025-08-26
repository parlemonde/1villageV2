'use client';

import classNames from 'clsx';
import { Select as RadixSelect, ScrollArea } from 'radix-ui';
import { useState } from 'react';

import styles from './select.module.css';
import { getMarginAndPaddingStyle, type MarginProps } from '../css-styles';
import ArrowDownIcon from '@/svg/arrowDown.svg';

interface SelectProps extends MarginProps {
    defaultValue?: string;
    value?: string;
    onChange?: (value: string) => void;
    options: { label: React.ReactNode; value: string }[];
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary';
    isFullWidth?: boolean;
    placeholder?: string;
    style?: React.CSSProperties;
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
    style = {},
    ...marginProps
}: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value);

    if (selectedValue !== value && value !== undefined) {
        setSelectedValue(value);
    }

    const selectedValueLabel = options.find((option) => option.value === selectedValue)?.label;

    return (
        <RadixSelect.Root
            defaultValue={defaultValue}
            value={value}
            onValueChange={(newValue) => {
                setSelectedValue(newValue);
                onChange?.(newValue);
            }}
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <RadixSelect.Trigger
                className={classNames(styles.selectTrigger, styles[`size-${size}`], styles[`color-${color}`], {
                    [styles[`isFullWidth`]]: isFullWidth,
                })}
                style={{ ...getMarginAndPaddingStyle(marginProps), ...style }}
            >
                <span className={styles.selectValue}>
                    {selectedValueLabel !== undefined ? selectedValueLabel : <RadixSelect.Value placeholder={placeholder} />}
                </span>
                <ArrowDownIcon className={styles.selectIcon} />
            </RadixSelect.Trigger>
            <RadixSelect.Portal>
                {isOpen && (
                    <RadixSelect.Content position="popper" side="bottom" align="start" sideOffset={0} className={styles.selectContent}>
                        <ScrollArea.Root className={styles.scrollAreaRoot} type="auto">
                            <RadixSelect.Viewport>
                                <ScrollArea.Viewport
                                    className={styles.selectViewport}
                                    style={{
                                        overflowY: undefined, // Needed to avoid a warning...
                                    }}
                                >
                                    {options.map((option) => (
                                        <RadixSelect.Item key={option.value} value={option.value} className={styles.selectItem}>
                                            <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                                        </RadixSelect.Item>
                                    ))}
                                </ScrollArea.Viewport>
                            </RadixSelect.Viewport>
                            <ScrollArea.Scrollbar className={styles.selectScrollbar} orientation="vertical">
                                <ScrollArea.Thumb className={styles.selectThumb} />
                            </ScrollArea.Scrollbar>
                        </ScrollArea.Root>
                    </RadixSelect.Content>
                )}
            </RadixSelect.Portal>
        </RadixSelect.Root>
    );
};
