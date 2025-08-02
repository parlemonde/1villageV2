'use client';

import { AvatarIcon } from '@radix-ui/react-icons';
import { Cross1Icon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import { usePathname } from 'next/navigation';
import { NavigationMenu } from 'radix-ui';
import React, { useContext } from 'react';

import styles from './navigation.module.css';
import { CountryFlag } from '@/components/CountryFlag';
import { IconButton } from '@/components/layout/Button';
import { Flex } from '@/components/layout/Flex';
import { Link } from '@/components/navigation/Link';
import { UserContext } from '@/contexts/userContext';
import { VillageContext } from '@/contexts/villageContext';
import type { Village } from '@/database/schemas/villages';
import FreeContentIcon from '@/svg/navigation/free-content.svg';
import HomeIcon from '@/svg/navigation/home.svg';

interface NavigationProps {
    village: Village;
    classroomCountryCode?: string;
}
export const Navigation = ({ village, classroomCountryCode }: NavigationProps) => {
    const pathname = usePathname();
    const firstPath = pathname.split('/')[1];
    return (
        <div className={styles.navigationWrapper}>
            <div className={styles.test}>
                <div className={classNames(styles.navigationCard, styles.navigationCardTitle)}>
                    <strong>Village-monde</strong>
                    {classroomCountryCode && <CountryFlag country={classroomCountryCode} />}
                    {village.countries
                        .filter((country) => country !== classroomCountryCode)
                        .map((country, index) => (
                            <CountryFlag
                                key={village.activePhase === 1 ? `mistery-${index}` : country}
                                country={country}
                                isMystery={village.activePhase === 1}
                            />
                        ))}
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
    const { classroom } = useContext(UserContext);
    const classroomCountryCode = classroom?.countryCode;
    const { village } = useContext(VillageContext);
    const pathname = usePathname();
    const firstPath = pathname.split('/')[1];

    return (
        <div className={styles.navigationMobileMenu} onClick={(e) => e.stopPropagation()}>
            <Flex isFullWidth justifyContent="flex-start" className={styles.navigationMobileMenuHeader}>
                <div className={classNames(styles.navigationCardTitle, styles.navigationCardTitleMobile)}>
                    <strong>Village-monde</strong>
                    {classroomCountryCode && <CountryFlag country={classroomCountryCode} />}
                    {village?.countries
                        .filter((country) => country !== classroomCountryCode)
                        .map((country, index) => (
                            <CountryFlag
                                key={village.activePhase === 1 ? `mistery-${index}` : country}
                                country={country}
                                isMystery={village.activePhase === 1}
                            />
                        ))}
                </div>
                <IconButton icon={Cross1Icon} onClick={onClose} />
            </Flex>
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
