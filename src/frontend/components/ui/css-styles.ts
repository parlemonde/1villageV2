export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type MarginProps = {
    marginTop?: Size | number | 'none' | 'auto';
    marginBottom?: Size | number | 'none' | 'auto';
    marginLeft?: Size | number | 'none' | 'auto';
    marginRight?: Size | number | 'none' | 'auto';
    marginX?: Size | number | 'none' | 'auto';
    marginY?: Size | number | 'none' | 'auto';
    margin?: Size | number | 'none' | 'auto';
};

export type PaddingProps = {
    paddingTop?: Size | number | 'none';
    paddingBottom?: Size | number | 'none';
    paddingLeft?: Size | number | 'none';
    paddingRight?: Size | number | 'none';
    paddingX?: Size | number | 'none';
    paddingY?: Size | number | 'none';
    padding?: Size | number | 'none';
};

export const SIZES: Record<Size, number> = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const getSize = (size?: Size | number | 'none' | 'auto'): number | 'auto' | undefined =>
    typeof size === 'number' ? size : size === 'none' ? 0 : size === 'auto' ? 'auto' : size ? SIZES[size] : undefined;

export const getMarginAndPaddingProps = <T>(
    props: T & MarginProps & PaddingProps,
): {
    marginAndPaddingProps: MarginProps & PaddingProps;
    otherProps: Omit<
        T & MarginProps & PaddingProps,
        | 'marginTop'
        | 'marginBottom'
        | 'marginLeft'
        | 'marginRight'
        | 'marginX'
        | 'marginY'
        | 'margin'
        | 'paddingTop'
        | 'paddingBottom'
        | 'paddingLeft'
        | 'paddingRight'
        | 'paddingX'
        | 'paddingY'
        | 'padding'
    >;
} => {
    const {
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        marginX,
        marginY,
        margin,
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
        paddingX,
        paddingY,
        padding,
        ...otherProps
    } = props;

    return {
        marginAndPaddingProps: {
            marginTop,
            marginBottom,
            marginLeft,
            marginRight,
            marginX,
            marginY,
            margin,
            paddingTop,
            paddingBottom,
            paddingLeft,
            paddingRight,
            paddingX,
            paddingY,
            padding,
        },
        otherProps,
    };
};

export const getMarginAndPaddingStyle = (props: MarginProps & PaddingProps): React.CSSProperties => {
    const result = {
        marginTop: getSize(props.marginTop || props.marginY || props.margin),
        marginBottom: getSize(props.marginBottom || props.marginY || props.margin),
        marginRight: getSize(props.marginRight || props.marginX || props.margin),
        marginLeft: getSize(props.marginLeft || props.marginX || props.margin),
        paddingTop: getSize(props.paddingTop || props.paddingY || props.padding),
        paddingBottom: getSize(props.paddingBottom || props.paddingY || props.padding),
        paddingRight: getSize(props.paddingRight || props.paddingX || props.padding),
        paddingLeft: getSize(props.paddingLeft || props.paddingX || props.padding),
    };
    return Object.keys(result).reduce(
        (acc, key) => (result[key as keyof typeof result] === undefined ? { ...acc } : { ...acc, [key]: result[key as keyof typeof result] }),
        {},
    );
};
