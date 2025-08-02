import { NavigationMenu } from 'radix-ui';
import React from 'react';

import styles from './menu.module.css';
import { Link } from '@/components/navigation/Link';

export interface MenuItem {
    icon?: React.ReactNode;
    label: string;
    href: string;
    onClick?: () => void;
    isActive?: boolean;
}
interface MenuProps {
    items: MenuItem[];
}
export const Menu = ({ items }: MenuProps) => {
    return (
        <NavigationMenu.Root orientation="vertical">
            <NavigationMenu.List className={styles.menuList}>
                {items.map((item) => (
                    <NavigationMenu.Item key={item.href}>
                        <NavigationMenu.Link asChild active={item.isActive}>
                            <Link href={item.href} className={styles.menuItem} onClick={item.onClick}>
                                {item.icon && <div className={styles.menuItemIcon}>{item.icon}</div>}
                                {item.label}
                            </Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                ))}
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
};
