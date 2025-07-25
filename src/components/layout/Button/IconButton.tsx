import type { IconProps } from '@radix-ui/react-icons/dist/types';
import classNames from 'clsx';
import * as React from 'react';

import type { ButtonProps } from './Button';
import { Button } from './Button';
import styles from './icon-button.module.css';

export type SVGIcon = React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;

const iconSize: Record<'sm' | 'md' | 'lg', number> = {
    sm: 18,
    md: 20,
    lg: 22,
};

type IconButtonProps = Omit<ButtonProps, 'label' | 'leftIcon' | 'rightIcon'> & {
    icon: SVGIcon;
    iconProps?: IconProps & React.RefAttributes<SVGSVGElement>;
};
const IconButtonWithRef = (
    { icon: Icon, iconProps, size = 'md', ...props }: IconButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement | HTMLAnchorElement>,
) => {
    return (
        <Button
            label={<Icon width={iconSize[size]} height={iconSize[size]} {...iconProps} />}
            {...props}
            ref={ref}
            className={classNames(props.className, styles.iconButton, styles[`iconButton--${size}`])}
        />
    );
};

export const IconButton = React.forwardRef(IconButtonWithRef);
