'use client';

import classNames from 'clsx';
import { Tooltip as RadixTooltip } from 'radix-ui';
import React from 'react';

import styles from './tooltip.module.css';

type TooltipProps = {
    position?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
    hasArrow?: boolean;
    maxWidth?: React.CSSProperties['width'];
    className?: string;
    isEnabled?: boolean;
    sideOffset?: number;
    content: React.ReactNode;
};
export const Tooltip = ({
    isEnabled = true,
    position = 'top',
    align = 'center',
    maxWidth = '300px',
    sideOffset = 6,
    className,
    content,
    hasArrow,
    children,
}: React.PropsWithChildren<TooltipProps>) => {
    if (!isEnabled || !content) {
        return <>{children}</>;
    }
    return (
        <RadixTooltip.Root>
            <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
            <RadixTooltip.Portal>
                <RadixTooltip.Content
                    sideOffset={sideOffset}
                    style={{ maxWidth }}
                    side={position}
                    align={align}
                    className={classNames(styles.tooltip, className)}
                >
                    {hasArrow && <RadixTooltip.Arrow className={styles.tooltipArrow} />}
                    {content}
                </RadixTooltip.Content>
            </RadixTooltip.Portal>
        </RadixTooltip.Root>
    );
};
