'use client';

import { Avatar } from '@frontend/components/Avatar';
import { CountryFlag } from '@frontend/components/CountryFlag';
import { Menu, MobileMenu } from '@frontend/components/navigation/Menu';
import type { MenuItem } from '@frontend/components/navigation/Menu/Menu';
import { IconButton } from '@frontend/components/ui/Button';
import { UserContext } from '@frontend/contexts/userContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import FreeContentIcon from '@frontend/svg/navigation/free-content.svg';
import HomeIcon from '@frontend/svg/navigation/home.svg';
import { Cross1Icon } from '@radix-ui/react-icons';
import { AvatarIcon, GearIcon } from '@radix-ui/react-icons';
import type { Village } from '@server/database/schemas/villages';
import { logout } from '@server-actions/authentication/logout';
import classNames from 'clsx';
import { usePathname } from 'next/navigation';
import React, { useContext } from 'react';

import styles from './navigation.module.css';

const getMenuItems = (firstPath: string, onClick?: () => void, avatar?: React.ReactNode): MenuItem[] => [
    {
        icon: <HomeIcon />,
        label: 'Accueil',
        href: '/',
        isActive: firstPath === '',
        onClick,
    },
    {
        icon: avatar || <AvatarIcon />,
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
    const { user, classroom } = useContext(UserContext);
    const pathname = usePathname();
    const firstPath = pathname.split('/')[1];

    const avatar = <Avatar user={user} classroom={classroom} isPelico={user?.role === 'admin' || user?.role === 'mediator'} size="sm" />;

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
                    <Menu items={getMenuItems(firstPath, undefined, avatar)} />
                </div>
            </div>
        </div>
    );
};

interface NavigationMobileMenuProps {
    onClose: () => void;
}
export const NavigationMobileMenu = ({ onClose }: NavigationMobileMenuProps) => {
    const { user, classroom } = useContext(UserContext);
    const classroomCountryCode = classroom?.countryCode;
    const { village } = useContext(VillageContext);
    const pathname = usePathname();
    const firstPath = pathname.split('/')[1];

    const avatar = <Avatar user={user} classroom={classroom} isPelico={user?.role === 'admin' || user?.role === 'mediator'} size="sm" />;

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
                    ...getMenuItems(
                        firstPath,
                        () => {
                            onClose();
                        },
                        avatar,
                    ),
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
