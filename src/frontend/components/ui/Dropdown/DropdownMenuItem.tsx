import { Link } from '@frontend/components/ui/Link';
import classNames from 'clsx';
import { DropdownMenu } from 'radix-ui';
import React from 'react';

import styles from './dropdown-menu-item.module.css';

interface DropdownMenuItemProps {
    label: string;
    href?: string;
    onClick?: () => void;
    color?: 'primary' | 'secondary' | 'danger';
    icon?: React.ComponentType<{ className?: string }>;
}

export const DropdownMenuItem = ({ label, href, onClick, color, icon: Icon }: DropdownMenuItemProps) => {
    const content = (
        <>
            {Icon && <Icon className={styles.icon} />}
            <span>{label}</span>
        </>
    );

    if (href) {
        return (
            <DropdownMenu.Item asChild className={classNames(styles.dropdownMenuItem, { [styles[`color-${color}`]]: color !== undefined })}>
                <Link href={href}>{content}</Link>
            </DropdownMenu.Item>
        );
    }
    return (
        <DropdownMenu.Item className={classNames(styles.dropdownMenuItem, { [styles[`color-${color}`]]: color !== undefined })} onClick={onClick}>
            {content}
        </DropdownMenu.Item>
    );
};
