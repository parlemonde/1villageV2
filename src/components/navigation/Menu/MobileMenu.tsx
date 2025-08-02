import { NavigationMenu } from 'radix-ui';
import React from 'react';

import type { MenuItem } from './Menu';
import styles from './mobile-menu.module.css';
import { Link } from '@/components/navigation/Link';

interface MobileMenuProps {
    items: MenuItem[];
}
export const MobileMenu = ({ items }: MobileMenuProps) => {
    return (
        <NavigationMenu.Root orientation="vertical">
            <NavigationMenu.List className={styles.mobileMenuList}>
                {items.map((item) => (
                    <NavigationMenu.Item key={item.href}>
                        <NavigationMenu.Link asChild active={item.isActive}>
                            <Link href={item.href} className={styles.mobileMenuItem} onClick={item.onClick}>
                                {item.icon && <div className={styles.mobileMenuItemIcon}>{item.icon}</div>}
                                {item.label}
                            </Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                ))}
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
};
