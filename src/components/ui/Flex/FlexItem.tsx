import React, { type JSX } from 'react';

import type { MarginProps, PaddingProps } from '../css-styles';
import { getMarginAndPaddingProps, getMarginAndPaddingStyle } from '../css-styles';

type FlexItemProps<T extends keyof JSX.IntrinsicElements = 'div'> = {
    as?: T;
    flexGrow?: React.CSSProperties['flexGrow'];
    flexShrink?: React.CSSProperties['flexShrink'];
    flexBasis?: React.CSSProperties['flexBasis'];
    alignSelf?: React.CSSProperties['alignSelf'];
    hasTextEllipsis?: boolean;
} & Omit<JSX.IntrinsicElements[T], 'ref' | 'key'> &
    MarginProps &
    PaddingProps;

export const FlexItem = <T extends keyof JSX.IntrinsicElements = 'div'>({
    as,
    flexGrow = 0,
    flexShrink = 1,
    flexBasis = 'auto',
    alignSelf,
    style = {},
    hasTextEllipsis = false,
    children,
    ...props
}: React.PropsWithChildren<FlexItemProps<T>>) => {
    const { marginAndPaddingProps, otherProps } = getMarginAndPaddingProps(props);
    const textEllipsisStyle: React.CSSProperties = hasTextEllipsis
        ? {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
          }
        : {};
    const flexItemStyle = {
        ...style,
        ...textEllipsisStyle,
        ...getMarginAndPaddingStyle(marginAndPaddingProps),
        flexGrow,
        flexShrink,
        flexBasis,
        alignSelf,
    };
    return React.createElement(
        as || 'div',
        {
            ...otherProps,
            style: flexItemStyle,
        },
        children,
    );
};
