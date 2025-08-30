import classNames from 'clsx';
import * as React from 'react';
import type { JSX } from 'react';

import styles from './input.module.css';
import type { MarginProps } from '../css-styles';
import { getMarginAndPaddingProps, getMarginAndPaddingStyle } from '../css-styles';

type TextAreaProps = {
    color?: 'primary' | 'secondary';
    isFullWidth?: boolean;
    size?: 'sm' | 'md' | 'lg';
    hasError?: boolean;
} & Omit<JSX.IntrinsicElements['textarea'], 'ref' | 'size'> &
    MarginProps;
export const TextArea = ({ color = 'primary', isFullWidth, size = 'md', hasError, onChange, className, style = {}, ...props }: TextAreaProps) => {
    const { marginAndPaddingProps, otherProps } = getMarginAndPaddingProps(props);
    const [isInvalid, setIsInvalid] = React.useState(false);

    return (
        <div className={classNames(styles.growWrap, styles[`growWrap-size-${size}`])} data-replicated-value={props.value}>
            <textarea
                {...otherProps}
                className={classNames(styles.input, styles.textareaInput, styles[`color-${color}`], styles[`size-${size}`], className, {
                    [styles[`isFullWidth`]]: isFullWidth,
                    [styles[`hasError`]]: hasError || isInvalid,
                })}
                style={{ ...style, ...getMarginAndPaddingStyle(marginAndPaddingProps) }}
                onInvalid={() => {
                    setIsInvalid(true);
                }}
                onChange={(event) => {
                    setIsInvalid(false);
                    onChange?.(event);
                }}
            ></textarea>
        </div>
    );
};
