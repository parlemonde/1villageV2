import type { MarginProps, PaddingProps } from '@frontend/components/ui/css-styles';
import { getMarginAndPaddingStyle } from '@frontend/components/ui/css-styles';
import classNames from 'clsx';
import * as React from 'react';

import styles from './title.module.css';

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
    variant = 'h1',
    color = 'primary',
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
