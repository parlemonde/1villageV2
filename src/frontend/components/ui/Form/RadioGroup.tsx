'use client';

import { getMarginAndPaddingStyle, type MarginProps } from '@frontend/components/ui/css-styles';
import classNames from 'clsx';
import { RadioGroup as RadixRadioGroup } from 'radix-ui';
import * as React from 'react';

import styles from './radio-group.module.css';

export interface RadioOption {
    label: React.ReactNode;
    value: string;
}

interface RadioGroupProps extends MarginProps {
    options: RadioOption[];
    value?: string;
    onChange?: (value: string) => void;
    readonly?: boolean;
}

export const RadioGroup = ({ options, value, onChange, readonly, ...marginProps }: RadioGroupProps) => {
    return (
        <RadixRadioGroup.Root
            onValueChange={(checkedValue) => onChange?.(checkedValue)}
            className={classNames(styles.root, { [styles.readonly]: readonly })}
            value={value}
            style={getMarginAndPaddingStyle(marginProps)}
        >
            {options.map((option) => (
                <div key={option.value} className={styles.itemContainer}>
                    <RadixRadioGroup.Item className={styles.item} value={option.value} id={option.value}>
                        <RadixRadioGroup.Indicator className={styles.indicator} />
                    </RadixRadioGroup.Item>
                    <label className={styles.label} htmlFor={option.value}>
                        {option.label}
                    </label>
                </div>
            ))}
        </RadixRadioGroup.Root>
    );
};
