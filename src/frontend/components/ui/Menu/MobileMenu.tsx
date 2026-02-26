import { Link } from '@frontend/components/ui/Link';
import classNames from 'clsx';
import { NavigationMenu } from 'radix-ui';
import React from 'react';

import type { MenuItem } from './Menu';
import styles from './mobile-menu.module.css';

interface MobileMenuProps {
    items: MenuItem[];
}
export const MobileMenu = ({ items }: MobileMenuProps) => {
    return (
        <NavigationMenu.Root orientation="vertical">
            <NavigationMenu.List className={styles.mobileMenuList}>
                {items.map((item) => (
                    <NavigationMenu.Item key={item.href || item.label}>
                        <NavigationMenu.Link asChild active={item.isActive}>
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className={classNames(styles.mobileMenuItem, {
                                        [styles[`text-${item.textAlign}`]]: item.textAlign,
                                        [styles[`color-${item.color}`]]: item.color && item.color !== 'primary',
                                        [styles.withTopSeparator]: item.hasSeparatorTop,
                                        [styles.disabled]: item.isDisabled,
                                    })}
                                    onClick={item.onClick}
                                >
                                    {item.icon && <div className={styles.mobileMenuItemIcon}>{item.icon}</div>}
                                    {item.label}
                                </Link>
                            ) : (
                                <button
                                    className={classNames(styles.mobileMenuItem, {
                                        [styles[`text-${item.textAlign}`]]: item.textAlign,
                                        [styles[`color-${item.color}`]]: item.color && item.color !== 'primary',
                                        [styles.withTopSeparator]: item.hasSeparatorTop,
                                    })}
                                    onClick={item.onClick}
                                >
                                    {item.icon && <div className={styles.mobileMenuItemIcon}>{item.icon}</div>}
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
