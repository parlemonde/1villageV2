import classNames from 'clsx';
import * as React from 'react';
import type { JSX } from 'react';

import styles from './button.module.css';
import { CircularProgress } from '../CircularProgress';
import type { MarginProps } from '../css-styles';
import { getMarginAndPaddingProps, getMarginAndPaddingStyle } from '../css-styles';
import { Link } from '@/components/navigation/Link';

export type ButtonProps = {
    as?: 'button' | 'a' | 'label';
    label: string | React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'light-grey';
    variant?: 'outlined' | 'contained' | 'borderless';
    size?: 'sm' | 'md' | 'lg';
    isFullWidth?: boolean;
    isUpperCase?: boolean;
    isVisuallyHidden?: boolean; // is selectable by keyboard only. For accessibility.
    isMobileOnly?: boolean;
    isTabletUpOnly?: boolean;
    isLoading?: boolean;
} & Omit<JSX.IntrinsicElements['a'] & JSX.IntrinsicElements['button'] & JSX.IntrinsicElements['label'], 'ref' | 'size' | 'children'> &
    MarginProps;
const ButtonWithRef = (
    {
        as,
        label,
        color = 'default',
        variant = 'outlined',
        type = 'button',
        size = 'md',
        leftIcon,
        rightIcon,
        isFullWidth,
        isUpperCase = true,
        className,
        isVisuallyHidden,
        isMobileOnly,
        isTabletUpOnly,
        style = {},
        isLoading,
        ...props
    }: ButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement | HTMLAnchorElement>,
) => {
    const { marginAndPaddingProps, otherProps } = getMarginAndPaddingProps(props);
    const buttonProps = {
        ...otherProps,
        type,
        disabled: isLoading || otherProps.disabled,
        className: classNames(
            styles.button,
            styles[`button--color-${color}`],
            styles[`button--variant-${variant}`],
            styles[`button--${size}`],
            className,
            {
                [styles[`button--is-full-width`]]: isFullWidth,
                [styles[`button--is-uppercase`]]: isUpperCase,
                [styles[`button--hidden`]]: isVisuallyHidden,
                [styles[`button--mobile-only`]]: isMobileOnly,
                [styles[`button--tablet-up-only`]]: isTabletUpOnly,
            },
        ),
        style: {
            ...getMarginAndPaddingStyle(marginAndPaddingProps),
            ...style,
        },
        ref,
    };
    const children = (
        <>
            {isLoading ? (
                <span style={{ display: 'inline-flex', marginRight: 8 }}>
                    <CircularProgress color="grey" size={20} />
                </span>
            ) : (
                leftIcon
            )}
            {label}
            {!isLoading && rightIcon}
        </>
    );
    if (as === 'a' && buttonProps.href?.startsWith('/')) {
        return (
            <Link {...buttonProps} ref={buttonProps.ref as React.Ref<HTMLAnchorElement>} href={buttonProps.href as string}>
                {children}
            </Link>
        );
    }
    return React.createElement(as || 'button', buttonProps, children);
};

export const Button = React.forwardRef(ButtonWithRef);
