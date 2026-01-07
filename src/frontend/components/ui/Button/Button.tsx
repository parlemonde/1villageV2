/* eslint-disable react-hooks/refs -- Rule is broken... */
import { Link } from '@frontend/components/ui/Link';
import classNames from 'clsx';
import * as React from 'react';
import type { JSX } from 'react';

import styles from './button.module.css';
import { CircularProgress } from '../CircularProgress';
import type { MarginProps } from '../css-styles';
import { getMarginAndPaddingProps, getMarginAndPaddingStyle } from '../css-styles';

export type ButtonProps = {
    as?: 'button' | 'a' | 'label';
    label: string | React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    hideLabelOnMobile?: boolean;
    color?: 'primary' | 'secondary' | 'warning' | 'error' | 'grey';
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
        color = 'grey',
        variant = 'outlined',
        type = 'button',
        size = 'md',
        leftIcon,
        rightIcon,
        hideLabelOnMobile = false,
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
        className: classNames(styles.button, styles[`color-${color}`], styles[`variant-${variant}`], styles[`size-${size}`], className, {
            [styles[`isFullWidth`]]: isFullWidth,
            [styles[`isUpperCase`]]: isUpperCase,
            [styles[`isVisuallyHidden`]]: isVisuallyHidden,
            [styles[`isMobileOnly`]]: isMobileOnly,
            [styles[`isTabletUpOnly`]]: isTabletUpOnly,
            [styles[`leftIcon`]]: Boolean(leftIcon),
        }),
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
            <span className={classNames(styles.inlineFlex, { [styles[`hideLabelOnMobile`]]: hideLabelOnMobile })}>{label}</span>
            {!isLoading && rightIcon}
        </>
    );
    if (as === 'a' && buttonProps.href?.startsWith('/')) {
        return (
            <Link {...buttonProps} ref={ref as React.Ref<HTMLAnchorElement>} href={buttonProps.href as string}>
                {children}
            </Link>
        );
    }
    return React.createElement(as || 'button', buttonProps, children);
};

export const Button = React.forwardRef(ButtonWithRef);
