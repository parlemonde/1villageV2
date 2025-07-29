'use client';
import classNames from 'clsx';
import * as React from 'react';
import type { JSX } from 'react';

import styles from './input.module.css';
import type { MarginProps } from '../css-styles';
import { getMarginAndPaddingProps, getMarginAndPaddingStyle } from '../css-styles';

type InputProps = {
    color?: 'primary' | 'secondary';
    isFullWidth?: boolean;
    size?: 'sm' | 'md' | 'lg';
    hasError?: boolean;
    iconAdornment?: React.ReactNode;
    iconAdornmentProps?: {
        position?: 'left' | 'right';
    };
} & Omit<JSX.IntrinsicElements['input'], 'ref' | 'size'> &
    MarginProps;
const InputComponent = (
    {
        color = 'primary',
        isFullWidth,
        size = 'md',
        hasError,
        onChange,
        className,
        iconAdornment,
        iconAdornmentProps = {},
        style = {},
        ...props
    }: InputProps,
    ref: React.ForwardedRef<HTMLInputElement | null>,
) => {
    const { marginAndPaddingProps, otherProps } = getMarginAndPaddingProps(props);
    const [isInvalid, setIsInvalid] = React.useState(false);

    const inputIconPosition = iconAdornmentProps.position || 'left';
    const inputIcon = iconAdornment ? (
        <div className={classNames(styles.inputIcon, styles[`inputIcon--${size}`], styles[`inputIcon--${inputIconPosition}`])}>{iconAdornment}</div>
    ) : null;

    return (
        <div className={classNames(styles.inputContainer, { [styles[`inputContainer--is-full-width`]]: isFullWidth })}>
            {inputIconPosition === 'left' && inputIcon}
            <input
                ref={ref}
                {...otherProps}
                className={classNames(styles.input, styles[`input--${color}`], styles[`input--${size}`], className, {
                    [styles['input--has-error']]: hasError || isInvalid,
                    [styles['input--with-left-icon']]: iconAdornment && inputIconPosition === 'left',
                    [styles['input--with-right-icon']]: iconAdornment && inputIconPosition === 'right',
                })}
                style={{ ...style, ...getMarginAndPaddingStyle(marginAndPaddingProps) }}
                onInvalid={() => {
                    setIsInvalid(true);
                }}
                onChange={(event) => {
                    setIsInvalid(false);
                    onChange?.(event);
                }}
            ></input>
            {inputIconPosition === 'right' && inputIcon}
        </div>
    );
};

export const Input = React.forwardRef<HTMLInputElement | null, InputProps>(InputComponent);
