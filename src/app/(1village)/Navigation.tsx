'use client';

import { AvatarIcon, GearIcon } from '@radix-ui/react-icons';
import { Cross1Icon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import { usePathname } from 'next/navigation';
import React, { useContext } from 'react';

import styles from './navigation.module.css';
import { CountryFlag } from '@/components/CountryFlag';
import { Menu, MobileMenu } from '@/components/navigation/Menu';
import type { MenuItem } from '@/components/navigation/Menu/Menu';
import { IconButton } from '@/components/ui/Button';
import { UserContext } from '@/contexts/userContext';
import { VillageContext } from '@/contexts/villageContext';
import type { Village } from '@/database/schemas/villages';
import { logout } from '@/server-actions/authentication/logout';
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
    const { user } = useContext(UserContext);
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
                                isMystery={village.activePhase === 1 && user?.role !== 'admin' && user?.role !== 'mediator'}
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
    const { user } = useContext(UserContext);
    const { classroom } = useContext(UserContext);
    const classroomCountryCode = classroom?.countryCode;
    const { village } = useContext(VillageContext);
    const pathname = usePathname();
    const firstPath = pathname.split('/')[1];

    return (
        <div className={styles.navigationMobileMenu} onClick={(e) => e.stopPropagation()}>
            <div className={styles.navigationMobileMenuHeader}>
                <div className={classNames(styles.navigationCardTitle, styles.navigationCardTitleMobile)}>
                    <strong>Village-monde</strong>
                    {classroomCountryCode && <CountryFlag country={classroomCountryCode} />}
                    {village?.countries
                        .filter((country) => country !== classroomCountryCode)
                        .map((country, index) => (
                            <CountryFlag
                                key={village.activePhase === 1 ? `mistery-${index}` : country}
                                country={country}
                                isMystery={village.activePhase === 1 && user?.role !== 'admin' && user?.role !== 'mediator'}
                            />
                        ))}
                </div>
                <IconButton icon={Cross1Icon} onClick={onClose} />
            </div>
            <MobileMenu
                items={[
                    ...getMenuItems(firstPath, () => {
                        onClose();
                    }),
                    ...(user?.role === 'admin'
                        ? [
                              {
                                  hasSeparatorTop: true,
                                  icon: <GearIcon />,
                                  label: 'Admin',
                                  href: '/admin',
                                  isActive: firstPath === 'admin',
                                  onClick: () => {
                                      onClose();
                                  },
                              },
                          ]
                        : []),
                    {
                        hasSeparatorTop: user?.role !== 'admin',
                        icon: <AvatarIcon />,
                        label: 'Mon compte',
                        href: '/mon-compte',
                        isActive: firstPath === 'mon-compte',
                        onClick: () => {
                            onClose();
                        },
                    },
                    {
                        hasSeparatorTop: true,
                        label: 'Se déconnecter',
                        textAlign: 'center',
                        color: 'danger',
                        onClick: () => {
                            logout().catch();
                        },
                    },
                ]}
            />
        </div>
    );
};
