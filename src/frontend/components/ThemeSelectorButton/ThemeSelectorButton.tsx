'use client';

import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useRef, useState } from 'react';

import styles from './theme-selector-button.module.css';

interface ThemeSelectorButtonProps {
    title: string;
    description?: string;
    onClick: () => void;
    dropdownContent?: React.ReactNode;
}

export const ThemeSelectorButton = ({ title, description, onClick, dropdownContent }: ThemeSelectorButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [height, setHeight] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    const handleClick = () => {
        if (dropdownContent) {
            setIsOpen(!isOpen);
            setHeight(isOpen ? 0 : ref.current?.scrollHeight || 0);
        } else {
            onClick();
        }
    };

    return (
        <div className={styles.button}>
            <div className={styles.buttonContent} onClick={handleClick}>
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
