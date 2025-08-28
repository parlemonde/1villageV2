'use client';
import classNames from 'clsx';
import { Portal } from 'radix-ui';
import * as React from 'react';
import type { JSX } from 'react';
import { RemoveScroll } from 'react-remove-scroll';

import styles from './backdrop.module.css';

export const BackDrop = ({ children, className, ...props }: React.PropsWithChildren<JSX.IntrinsicElements['div']>) => {
    return (
        <RemoveScroll>
            <Portal.Root className={classNames(styles.backdrop, className)} {...props}>
                {children}
            </Portal.Root>
        </RemoveScroll>
    );
};
