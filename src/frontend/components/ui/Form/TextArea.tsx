import classNames from 'clsx';
import * as React from 'react';
import type { JSX } from 'react';

import styles from './input.module.css';

type TextAreaProps = {
    color?: 'primary' | 'secondary';
    isFullWidth?: boolean;
    size?: 'sm' | 'md' | 'lg';
    hasError?: boolean;
} & Omit<JSX.IntrinsicElements['textarea'], 'ref' | 'size'>;
export const TextArea = ({ color = 'primary', isFullWidth, size = 'md', hasError, onChange, className, style = {}, ...props }: TextAreaProps) => {
    const [isInvalid, setIsInvalid] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    return (
        <div className={classNames(styles.textareaWrapper, { [styles.textareaWrapperFocused]: isFocused })}>
            {props.placeholder && isFocused && (
                <label className={classNames(styles.floatingLabel, styles[`floatingLabel-${color}`])}>{props.placeholder}</label>
            )}
            <div className={classNames(styles.growWrap, styles[`growWrap-size-${size}`])} data-replicated-value={props.value}>
                <textarea
                    {...props}
                    className={classNames(styles.input, styles.textareaInput, styles[`color-${color}`], styles[`size-${size}`], className, {
                        [styles[`isFullWidth`]]: isFullWidth,
                        [styles[`hasError`]]: hasError || isInvalid,
                        [styles.textareaFocused]: isFocused,
                    })}
                    style={style}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    onInvalid={() => {
                        setIsInvalid(true);
                    }}
                    onChange={(event) => {
                        setIsInvalid(false);
                        onChange?.(event);
                    }}
                    placeholder={isFocused ? '' : props.placeholder}
                ></textarea>
            </div>
        </div>
    );
};
