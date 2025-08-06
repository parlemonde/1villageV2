import React, { type JSX } from 'react';

import type { MarginProps, PaddingProps, Size } from '../css-styles';
import { getMarginAndPaddingProps, getMarginAndPaddingStyle, SIZES } from '../css-styles';

type FlexProps = {
    flexDirection?: React.CSSProperties['flexDirection'];
    flexWrap?: React.CSSProperties['flexWrap'];
    justifyContent?: React.CSSProperties['justifyContent'];
    alignItems?: React.CSSProperties['alignItems'];
    gap?: React.CSSProperties['gap'] | Size;
    isInline?: boolean;
    isFullWidth?: boolean;
    isFullHeight?: boolean;
} & Omit<JSX.IntrinsicElements['div'], 'ref'> &
    MarginProps &
    PaddingProps;
export const Flex = ({
    children,
    style = {},
    flexDirection = 'row',
    flexWrap = 'nowrap',
    justifyContent = 'flex-start',
    alignItems = 'center',
    gap,
    isInline = false,
    isFullHeight = false,
    isFullWidth = false,
    ...props
}: React.PropsWithChildren<FlexProps>) => {
    const { marginAndPaddingProps, otherProps } = getMarginAndPaddingProps(props);
    const flexStyle: React.CSSProperties = {
        ...style,
        ...getMarginAndPaddingStyle(marginAndPaddingProps),
        display: isInline ? 'inline-flex' : 'flex',
        flexWrap,
        flexDirection,
        justifyContent,
        alignItems,
        boxSizing: 'border-box',
    };
    if (isFullHeight) {
        flexStyle.height = '100%';
    }
    if (isFullWidth) {
        flexStyle.width = '100%';
    }
    if (gap) {
        flexStyle.gap = typeof gap === 'string' ? SIZES[gap as Size] || gap : gap;
    }

    return (
        <div {...otherProps} style={flexStyle}>
            {children}
        </div>
    );
};
