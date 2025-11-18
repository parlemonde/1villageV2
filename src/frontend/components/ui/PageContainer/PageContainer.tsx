'use client';

import classNames from 'clsx';
import styles from './PageContainer.module.css';
import { Title } from '../Title';

interface PageContainerProps {
    title?: string;
    actionButtons?: React.ReactNode[];
    children?: React.ReactNode;
    className?: string;
}

/**
 * PageContainer - A reusable wrapper component for consistent page margins and padding
 * @param className - Additional CSS classes to merge
 */
export const PageContainer = ({ title, actionButtons, children, className }: PageContainerProps) => {
    const hasHeader = title || actionButtons;

    return (
        <div className={classNames(styles.pageContainer, className)}>
            {hasHeader && (
                <div className={styles.header}>
                    {title && <Title className={styles.title}>{title}</Title>}
                    {actionButtons && (
                        <div className={styles.actions}>
                            {actionButtons.map((button, index) => (
                                <div key={index}>{button}</div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {children}
        </div>
    );
};
