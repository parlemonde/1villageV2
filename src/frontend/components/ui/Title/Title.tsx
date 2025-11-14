import classNames from 'clsx';
import * as React from 'react';

import styles from './title.module.css';
import type { MarginProps, PaddingProps } from '../css-styles';
import { getMarginAndPaddingStyle } from '../css-styles';

type TitleProps = {
    id?: string;
    variant?: 'h1' | 'h2' | 'h3';
    color?: 'primary' | 'secondary' | 'inherit';
    className?: string;
    style?: React.CSSProperties;
} & MarginProps &
    PaddingProps;
export const Title = ({
    id,
    variant = 'h2',
    color = 'inherit',
    className,
    style = {},
    children,
    ...marginAndPaddingProps
}: React.PropsWithChildren<TitleProps>) => {
    return React.createElement(
        variant,
        {
            style: {
                ...style,
                ...getMarginAndPaddingStyle(marginAndPaddingProps),
            },
            className: classNames(className, styles[`title-${variant}`], { [styles[`color-${color}`]]: color !== 'inherit' }),
            id,
        },
        children,
    );
};
