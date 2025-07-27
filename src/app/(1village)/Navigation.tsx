'use client';

import { AvatarIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavigationMenu } from 'radix-ui';
import React from 'react';

import styles from './navigation.module.css';
import { CountryFlag } from '@/components/CountryFlag';
import FreeContentIcon from '@/svg/navigation/free-content.svg';
import HomeIcon from '@/svg/navigation/home.svg';

export const Navigation = () => {
    const pathname = usePathname();
    const firstPath = pathname.split('/')[1];
    return (
        <div className={styles.navigationWrapper}>
            <div className={styles.test}>
                <div className={classNames(styles.navigationCard, styles.navigationCardTitle)}>
                    <strong>Village-monde</strong>
                    <CountryFlag country="fr" />
                    <CountryFlag isMystery />
                </div>
                <div className={styles.navigationCard} style={{ marginTop: '16px' }}>
                    <NavigationMenu.Root orientation="vertical">
                        <NavigationMenu.List className={styles.navigationMenuList}>
                            <NavigationMenu.Item>
                                <NavigationMenu.Link asChild active={firstPath === ''}>
                                    <Link href="/" className={styles.navigationMenuItem}>
                                        <HomeIcon className={styles.navigationMenuItemIcon} />
                                        Accueil
                                    </Link>
                                </NavigationMenu.Link>
                            </NavigationMenu.Item>
                            <NavigationMenu.Item>
                                <NavigationMenu.Link asChild active={firstPath === 'ma-classe'}>
                                    <Link href="/ma-classe" className={styles.navigationMenuItem}>
                                        <AvatarIcon className={styles.navigationMenuItemIcon} />
                                        Notre classe et nos activités
                                    </Link>
                                </NavigationMenu.Link>
                            </NavigationMenu.Item>
                            <NavigationMenu.Item>
                                <NavigationMenu.Link asChild active={firstPath === 'contenu-libre'}>
                                    <Link href="/contenu-libre" className={styles.navigationMenuItem}>
                                        <FreeContentIcon className={styles.navigationMenuItemIcon} />
                                        Publier un contenu libre
                                    </Link>
                                </NavigationMenu.Link>
                            </NavigationMenu.Item>
                        </NavigationMenu.List>
                    </NavigationMenu.Root>
                </div>
            </div>
        </div>
    );
};

interface NavigationMobileMenuProps {
    onClose: () => void;
}
export const NavigationMobileMenu = ({ onClose }: NavigationMobileMenuProps) => {
    const pathname = usePathname();
    const firstPath = pathname.split('/')[1];

    return (
        <div className={styles.navigationMobileMenu} onClick={(e) => e.stopPropagation()}>
            <div className={classNames(styles.navigationCardTitle, styles.navigationCardTitleMobile)}>
                <strong>Village-monde</strong>
                <CountryFlag country="fr" />
                <CountryFlag isMystery />
            </div>
            <NavigationMenu.Root orientation="vertical">
                <NavigationMenu.List className={classNames(styles.navigationMenuList, styles.navigationMenuListMobile)}>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link asChild active={firstPath === ''}>
                            <Link
                                href="/"
                                className={classNames(styles.navigationMenuItem, styles.navigationMenuItemMobile)}
                                onClick={() => {
                                    onClose();
                                }}
                            >
                                <HomeIcon className={styles.navigationMenuItemIcon} />
                                Accueil
                            </Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link asChild active={firstPath === 'ma-classe'}>
                            <Link
                                href="/ma-classe"
                                className={classNames(styles.navigationMenuItem, styles.navigationMenuItemMobile)}
                                onClick={() => {
                                    onClose();
                                }}
                            >
                                <AvatarIcon className={styles.navigationMenuItemIcon} />
                                Notre classe et nos activités
                            </Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                    <NavigationMenu.Item>
                        <NavigationMenu.Link asChild active={firstPath === 'contenu-libre'}>
                            <Link
                                href="/contenu-libre"
                                className={classNames(styles.navigationMenuItem, styles.navigationMenuItemMobile)}
                                onClick={() => {
                                    onClose();
                                }}
                            >
                                <FreeContentIcon className={styles.navigationMenuItemIcon} />
                                Publier un contenu libre
                            </Link>
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                </NavigationMenu.List>
            </NavigationMenu.Root>
        </div>
    );
};
