'use client';

import classNames from 'clsx';
import * as React from 'react';
import type { JSX } from 'react';

import styles from './backdrop.module.css';

export const BackDrop = ({ children, className, ...props }: React.PropsWithChildren<JSX.IntrinsicElements['div']>) => {
    // Prevent scrolling when the backdrop is open
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <div className={classNames(styles.backdrop, className)} {...props}>
            {children}
        </div>
    );
};
