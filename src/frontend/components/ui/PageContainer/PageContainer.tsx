'use client';

import classNames from 'clsx';
import styles from './PageContainer.module.css';
import { Title } from '../Title';

interface PageContainerProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * PageContainer - A reusable wrapper component for consistent page margins and padding
 * @param className - Additional CSS classes to merge
 */
export const PageContainer = ({ title, children, className }: PageContainerProps) => {
    return (
        <div className={classNames(styles.pageContainer, className)}>
            {title && <Title marginBottom="md">{title}</Title>}
            {children}
        </div>
    );
};
