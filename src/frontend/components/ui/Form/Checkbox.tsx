'use client';

import CheckedIcon from '@frontend/svg/checkedIcon.svg';
import UncheckedIcon from '@frontend/svg/uncheckedIcon.svg';
import { Checkbox as RadixCheckbox } from 'radix-ui';
import * as React from 'react';

import styles from './checkbox.module.css';

const CHECKBOX_SIZE = {
    sm: 20,
    md: 24,
    lg: 28,
};

type CheckboxProps = {
    name: string;
    label?: React.ReactNode;
    isChecked?: boolean;
    isDisabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    onChange?: (newIsChecked: boolean) => void;
};
export const Checkbox = ({ name, label, isChecked, isDisabled, size = 'md', onChange }: CheckboxProps) => {
    return (
        <div className={styles.Checkbox}>
            <RadixCheckbox.Root asChild checked={isChecked} onCheckedChange={onChange} id={name} name={name} disabled={isDisabled}>
                <button disabled={isDisabled} className={styles.Icon}>
                    {isChecked ? (
                        <CheckedIcon style={{ width: CHECKBOX_SIZE[size], height: CHECKBOX_SIZE[size] }} />
                    ) : (
                        <UncheckedIcon style={{ width: CHECKBOX_SIZE[size], height: CHECKBOX_SIZE[size] }} />
                    )}
                </button>
            </RadixCheckbox.Root>
            {label && (
                <label className={styles.Label} htmlFor={name}>
                    {label}
                </label>
            )}
        </div>
    );
};
