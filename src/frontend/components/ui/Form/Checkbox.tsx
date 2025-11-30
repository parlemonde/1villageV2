'use client';

import CheckedIcon from '@frontend/svg/checkedIcon.svg';
import UncheckedIcon from '@frontend/svg/uncheckedIcon.svg';
import { Checkbox as RadixCheckbox } from 'radix-ui';
import * as React from 'react';

import styles from './checkbox.module.css';
import { IconButton } from '../Button/IconButton';
import type { SVGIcon } from '../Button/IconButton';

type CheckboxProps = {
    name: string;
    label?: string;
    isChecked?: boolean;
    isDisabled?: boolean;
    onChange?: (newIsChecked: boolean) => void;
};
export const Checkbox = ({ name, label, isChecked, isDisabled, onChange }: CheckboxProps) => {
    return (
        <div className={styles.Checkbox}>
            <RadixCheckbox.Root asChild checked={isChecked} onCheckedChange={onChange} id={name} name={name} disabled={isDisabled}>
                <IconButton
                    icon={(isChecked ? CheckedIcon : UncheckedIcon) as SVGIcon}
                    variant="borderless"
                    marginRight={label ? 'xs' : -8}
                    marginLeft={-8}
                    disabled={isDisabled}
                    color="primary"
                    iconProps={{
                        width: 24,
                        height: 24,
                        color: isDisabled ? 'grey--300' : isChecked ? 'var(--primary-color)' : 'rgba(0, 0, 0, 0.6)',
                    }}
                />
            </RadixCheckbox.Root>
            {label && (
                <label className={styles.Checkbox__Label} htmlFor={name}>
                    {label}
                </label>
            )}
        </div>
    );
};
