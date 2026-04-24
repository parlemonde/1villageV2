'use client';

import { getMarginAndPaddingProps, getMarginAndPaddingStyle, type MarginProps, type PaddingProps } from '@frontend/components/ui/css-styles';
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import { useEffect, useRef, useState } from 'react';

import styles from './theme-selector-button.module.css';

interface ThemeSelectorButtonProps extends MarginProps, PaddingProps {
    title: string;
    description?: string;
    isActive?: boolean;
    onClick?: () => void;
    dropdownContent?: React.ReactNode;
    hasHoverEffect?: boolean;
    isInitiallyOpen?: boolean;
}

export const ThemeSelectorButton = ({
    title,
    description,
    isActive = false,
    onClick,
    dropdownContent,
    hasHoverEffect = true,
    ...otherProps
}: ThemeSelectorButtonProps) => {
    const { marginAndPaddingProps } = getMarginAndPaddingProps(otherProps);
    const [isOpen, setIsOpen] = useState(dropdownContent && isActive);
    const [height, setHeight] = useState(dropdownContent && isActive ? 'auto' : 0);
    const ref = useRef<HTMLDivElement>(null);

    const handleClick = () => {
        if (dropdownContent) {
            setIsOpen(!isOpen);
            setHeight(isOpen ? 0 : ref.current?.scrollHeight || 0);
        } else {
            onClick?.();
        }
    };

    useEffect(() => {
        if (!ref.current || !isOpen) return;

        const resizeObserver = new ResizeObserver(() => {
            if (ref.current) {
                setHeight(ref.current.scrollHeight);
            }
        });

        resizeObserver.observe(ref.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [isOpen]);

    return (
        <div
            className={classNames(styles.button, { [styles.active]: isActive && hasHoverEffect, [styles.hoverEffect]: hasHoverEffect })}
            style={getMarginAndPaddingStyle(marginAndPaddingProps)}
        >
            <div className={styles.buttonContent} role="button" onClick={handleClick}>
                <div className={styles.left}>
                    <p className={styles.title}>{title}</p>
                    {description && <span>{description}</span>}
                </div>
                <div className={styles.right}>
                    {!isOpen && <ChevronRightIcon className={styles.icon} />}
                    {isOpen && <ChevronDownIcon className={styles.icon} />}
                </div>
            </div>
            {dropdownContent && (
                <div style={{ height: height, overflow: 'hidden', transition: 'height .2s ease' }}>
                    <div className={styles.dropdown} ref={ref}>
                        {dropdownContent}
                    </div>
                </div>
            )}
        </div>
    );
};
