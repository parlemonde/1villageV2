import { Link } from '@frontend/components/ui/Link';
import classNames from 'clsx';
import { NavigationMenu } from 'radix-ui';
import React from 'react';

import styles from './menu.module.css';

export interface MenuItem {
    icon?: React.ReactNode;
    label: string;
    href?: string;
    onClick?: () => void;
    isActive?: boolean;
    isDisabled?: boolean;
    hasSeparatorTop?: boolean;
    textAlign?: 'left' | 'center' | 'right';
    color?: 'primary' | 'secondary' | 'danger';
}
interface MenuProps {
    items: MenuItem[];
}
export const Menu = ({ items }: MenuProps) => {
    return (
        <NavigationMenu.Root orientation="vertical">
            <NavigationMenu.List className={styles.menuList}>
                {items.map((item) => (
                    <NavigationMenu.Item key={item.href || item.label}>
                        <NavigationMenu.Link asChild active={item.isActive}>
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className={classNames(styles.menuItem, {
                                        [styles[`text-${item.textAlign}`]]: item.textAlign,
                                        [styles[`color-${item.color}`]]: item.color && item.color !== 'primary',
                                        [styles.withTopSeparator]: item.hasSeparatorTop,
                                        [styles.disabled]: item.isDisabled,
                                    })}
                                    onClick={item.onClick}
                                >
                                    {item.icon && <div className={styles.menuItemIcon}>{item.icon}</div>}
                                    {item.label}
                                </Link>
                            ) : (
                                <button
                                    tabIndex={0}
                                    className={classNames(styles.menuItem, {
                                        [styles[`text-${item.textAlign}`]]: item.textAlign,
                                        [styles[`color-${item.color}`]]: item.color && item.color !== 'primary',
                                        [styles.withTopSeparator]: item.hasSeparatorTop,
                                    })}
                                    onClick={item.onClick}
                                >
                                    {item.icon && <div className={styles.menuItemIcon}>{item.icon}</div>}
                                    {item.label}
                                </button>
                            )}
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                ))}
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
};
