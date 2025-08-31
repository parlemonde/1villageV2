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

    return (
        <div className={classNames(styles.growWrap, styles[`growWrap-size-${size}`])} data-replicated-value={props.value}>
            <textarea
                {...props}
                className={classNames(styles.input, styles.textareaInput, styles[`color-${color}`], styles[`size-${size}`], className, {
                    [styles[`isFullWidth`]]: isFullWidth,
                    [styles[`hasError`]]: hasError || isInvalid,
                })}
                style={style}
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
