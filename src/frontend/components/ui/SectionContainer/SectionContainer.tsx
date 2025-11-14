'use client';

import classNames from 'clsx';
import styles from './SectionContainer.module.css';

interface SectionContainerProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * SectionContainer - A reusable wrapper component for content cards
 * Provides consistent styling (white background, shadow, border-radius, padding)
 * @param className - Additional CSS classes to merge
 */
export const SectionContainer = ({ title, children, className }: SectionContainerProps) => {
    return (
        <div className={classNames(styles.section, className)}>
            {title && <h2 className={styles.sectionTitle}>{title}</h2>}
            {children}
        </div>
    );
};
