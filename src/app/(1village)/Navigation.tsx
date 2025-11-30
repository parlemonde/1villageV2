'use client';

import { Avatar } from '@frontend/components/Avatar';
import { CountryFlag } from '@frontend/components/CountryFlag';
import { IconButton } from '@frontend/components/ui/Button';
import { Menu, MobileMenu } from '@frontend/components/ui/Menu';
import type { MenuItem } from '@frontend/components/ui/Menu/Menu';
import { UserContext } from '@frontend/contexts/userContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import { usePhase } from '@frontend/hooks/usePhase';
import FreeContentIcon from '@frontend/svg/navigation/free-content.svg';
import HomeIcon from '@frontend/svg/navigation/home.svg';
import { jsonFetcher } from '@lib/json-fetcher';
import { Cross1Icon, ExitIcon } from '@radix-ui/react-icons';
import { AvatarIcon, GearIcon } from '@radix-ui/react-icons';
import type { ActivityType } from '@server/database/schemas/activity-types';
import type { Village } from '@server/database/schemas/villages';
import { logout } from '@server-actions/authentication/logout';
import classNames from 'clsx';
import { usePathname } from 'next/navigation';
import React, { useContext } from 'react';
import useSWR from 'swr';

import styles from './navigation.module.css';

const getMenuItems = (firstPath: string, onClick?: () => void, avatar?: React.ReactNode, isPelico?: boolean): MenuItem[] => [
    {
        icon: <HomeIcon />,
        label: 'Accueil',
        href: '/',
        isActive: firstPath === '',
        onClick,
    },
    {
        icon: avatar || <AvatarIcon />,
        label: isPelico ? 'Activités de Pélico' : 'Nos activités',
        href: '/my-activities',
        isActive: firstPath === 'my-activities',
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
    const [phase] = usePhase();
    const pathname = usePathname();
    const firstPath = pathname.split('/')[1];

    const { data: activityTypes = [] } = useSWR<ActivityType[]>(phase !== null ? `/api/activities/types?phase=${phase}` : null, jsonFetcher, {
        keepPreviousData: true,
    });

    // Do not display navigation on activity page
    if (pathname.startsWith('/activities/')) {
        return null;
    }

    const avatar = (
        <Avatar user={user} classroom={classroom} isPelico={user?.role === 'admin' || user?.role === 'mediator'} size="sm" isLink={false} />
    );

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
                <div className={classNames(styles.navigationCard, styles.navigationCardMenu)}>
                    <Menu items={getMenuItems(firstPath, undefined, avatar, user?.role === 'admin' || user?.role === 'mediator')} />
                </div>
                {activityTypes.length > 0 && (
                    <div className={classNames(styles.navigationCard, styles.navigationCardMenu)}>
                        <Menu
                            items={activityTypes.map((type) => ({
                                label: type,
                            }))}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

interface NavigationMobileMenuProps {
    onClose: () => void;
}
export const NavigationMobileMenu = ({ onClose }: NavigationMobileMenuProps) => {
    const { user, classroom } = useContext(UserContext);
    const [phase] = usePhase();
    const classroomCountryCode = classroom?.countryCode;
    const { village } = useContext(VillageContext);
    const pathname = usePathname();
    const firstPath = pathname.split('/')[1];

    const avatar = (
        <Avatar user={user} classroom={classroom} isPelico={user?.role === 'admin' || user?.role === 'mediator'} size="sm" isLink={false} />
    );

    const { data: activityTypes = [] } = useSWR<ActivityType[]>(phase !== null ? `/api/activities/types?phase=${phase}` : null, jsonFetcher, {
        keepPreviousData: true,
    });

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
                        user?.role === 'admin' || user?.role === 'mediator',
                    ),
                    ...activityTypes.map((type, index) => ({
                        hasSeparatorTop: index === 0,
                        label: type,
                    })),
                    ...(user?.role === 'admin'
                        ? [
                              {
                                  hasSeparatorTop: true,
                                  icon: <GearIcon />,
                                  label: 'Portail admin',
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
                        icon: <ExitIcon />,
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
