import classNames from 'clsx';
import * as React from 'react';

import { getMarginAndPaddingStyle, type MarginProps, type PaddingProps } from '../css-styles';
import styles from './field.module.css';

type FieldProps = {
    name?: string;
    label?: React.ReactNode;
    input: React.ReactNode;
    helperText?: string;
    helperTextStyle?: React.CSSProperties;
    className?: string;
    style?: React.CSSProperties;
} & MarginProps &
    PaddingProps;
export const Field = ({ name, label, input, className, style = {}, helperText, helperTextStyle = {}, ...marginAndPaddingProps }: FieldProps) => {
    return (
        <div className={classNames(styles.field, className)} style={{ ...style, ...getMarginAndPaddingStyle(marginAndPaddingProps) }}>
            {label && <label htmlFor={name}>{label}</label>}
            {input}
            {helperText && (
                <p className={styles.helperText} style={helperTextStyle}>
                    {helperText}
                </p>
            )}
        </div>
    );
};
