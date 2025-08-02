'use client';

import { AvatarIcon } from '@radix-ui/react-icons';
import { Cross1Icon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import { usePathname } from 'next/navigation';
import React, { useContext } from 'react';

import styles from './navigation.module.css';
import { CountryFlag } from '@/components/CountryFlag';
import { IconButton } from '@/components/layout/Button';
import { Flex } from '@/components/layout/Flex';
import { Menu, MobileMenu } from '@/components/navigation/Menu';
import type { MenuItem } from '@/components/navigation/Menu/Menu';
import { UserContext } from '@/contexts/userContext';
import { VillageContext } from '@/contexts/villageContext';
import type { Village } from '@/database/schemas/villages';
import FreeContentIcon from '@/svg/navigation/free-content.svg';
import HomeIcon from '@/svg/navigation/home.svg';

const getMenuItems = (firstPath: string, onClick?: () => void): MenuItem[] => [
    {
        icon: <HomeIcon />,
        label: 'Accueil',
        href: '/',
        isActive: firstPath === '',
        onClick,
    },
    {
        icon: <AvatarIcon />,
        label: 'Notre classe et nos activités',
        href: '/ma-classe',
        isActive: firstPath === 'ma-classe',
        onClick,
    },
    {
        icon: <FreeContentIcon />,
        label: 'Publier un contenu libre',
        href: '/contenu-libre',
        isActive: firstPath === 'contenu-libre',
        onClick,
    },
];

interface NavigationProps {
    village: Village;
    classroomCountryCode?: string;
}
export const Navigation = ({ village, classroomCountryCode }: NavigationProps) => {
    const pathname = usePathname();
    const firstPath = pathname.split('/')[1];
    return (
        <div className={styles.navigationWrapper}>
            <div className={styles.stickyContent}>
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
                    <Menu items={getMenuItems(firstPath)} />
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
            <MobileMenu
                items={getMenuItems(firstPath, () => {
                    onClose();
                })}
            />
        </div>
    );
};
