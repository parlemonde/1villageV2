'use client';

import { Title } from '@frontend/components/ui/Title';
import classNames from 'clsx';

import styles from './PageContainer.module.css';

interface PageContainerProps {
    title?: string;
    titleVariant?: 'h1' | 'h2' | 'h3';
    className?: string;
    style?: React.CSSProperties;
}

/**
 * PageContainer - A reusable wrapper component for consistent page margins and padding
 * @param className - Additional CSS classes to merge
 */
export const PageContainer = ({ title, titleVariant = 'h1', className, style, children }: React.PropsWithChildren<PageContainerProps>) => {
    return (
        <div className={classNames(styles.pageContainer, className)} style={style}>
            {title && (
                <Title variant={titleVariant} marginBottom="md">
                    {title}
                </Title>
            )}
            {children}
        </div>
    );
};
