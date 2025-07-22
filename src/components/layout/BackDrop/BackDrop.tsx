import classNames from 'clsx';
import * as React from 'react';
import type { JSX } from 'react';

import styles from './backdrop.module.css';

export const BackDrop = ({ children, className, ...props }: React.PropsWithChildren<JSX.IntrinsicElements['div']>) => {
    return (
        <div className={classNames(styles.backdrop, className)} {...props}>
            {children}
        </div>
    );
};
