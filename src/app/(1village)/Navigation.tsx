'use client';

import { Avatar } from '@frontend/components/Avatar';
import { CountryFlag } from '@frontend/components/CountryFlag';
import { ACTIVITY_ICONS, ACTIVITY_LABELS, ACTIVITY_URLS } from '@frontend/components/activities/activities-constants';
import { ACTIVITY_TYPES_ENUM } from '@server/database/schemas/activity-types';
import { IconButton } from '@frontend/components/ui/Button';
import { Link } from '@frontend/components/ui/Link';
import { Menu, MobileMenu } from '@frontend/components/ui/Menu';
import type { MenuItem } from '@frontend/components/ui/Menu/Menu';
import { UserContext } from '@frontend/contexts/userContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import { usePhase } from '@frontend/hooks/usePhase';
import HomeIcon from '@frontend/svg/navigation/home.svg';
import { jsonFetcher } from '@lib/json-fetcher';
import { Cross1Icon, ExitIcon } from '@radix-ui/react-icons';
import { AvatarIcon, GearIcon, MixerHorizontalIcon } from '@radix-ui/react-icons';
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
];

const getActivityMenuItem = (type: ActivityType, firstPath: string, isActivityTypeInPhase: Boolean, hasVillageReachedPhase: Boolean, onClick?: () => void): MenuItem | null => {
    const Icon = ACTIVITY_ICONS[type];
    const label = ACTIVITY_LABELS[type] || type;
    const href = ACTIVITY_URLS[type];

    if (!href) {
        return null;
    }

    return {
        icon: Icon !== null ? <Icon /> : undefined,
        label,
        href,
        isActive: firstPath === href.split('/')[1],
        isDisabled: !isActivityTypeInPhase || !hasVillageReachedPhase,
        onClick: firstPath === href.split('/')[1] ? () => { alert('Lien inactif'); } : onClick,
    };
};

interface NavigationProps {
    village: Village;
    classroomCountryCode?: string;
}
export const Navigation = ({ village, classroomCountryCode }: NavigationProps) => {
    const { user, classroom } = useContext(UserContext);
    const [phase] = usePhase();
    const pathname = usePathname();
    const firstPath = pathname.split('/')[1];
    const isPelico = user?.role === 'admin' || user?.role === 'mediator';

    let { data: activityTypes = [] } = useSWR<ActivityType[]>(phase !== null ? `/api/activities/types?phase=${phase}` : null, jsonFetcher, {
        keepPreviousData: true,
    });

    // Do not display navigation on activity page
    if (pathname.startsWith('/activities/')) {
        return null;
    }

    const avatar = <Avatar user={user} classroom={classroom} isPelico={isPelico} size="sm" isLink={false} />;

    const activityMenuItems = ACTIVITY_TYPES_ENUM.map((type) => {
        const isActivityTypeInPhase = activityTypes.includes(type as ActivityType);
        const hasVillageReachedPhase = !!(phase && village.activePhase >= phase);
        return getActivityMenuItem(type, firstPath, isActivityTypeInPhase, hasVillageReachedPhase)
    }).filter((item) => item !== null);

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
                                isMystery={village.activePhase === 1 && !isPelico}
                            />
                        ))}
                </div>
                <div className={classNames(styles.navigationCard, styles.navigationCardMenu)}>
                    <Menu items={getMenuItems(firstPath, undefined, avatar, isPelico)} />
                </div>
                {activityMenuItems.length > 0 && (
                    <div className={classNames(styles.navigationCard, styles.navigationCardMenu)}>
                        <Menu items={activityMenuItems} />
                    </div>
                )}
                <Link href={'/cgu'} className={classNames(styles.cguLink)}>
                    Conditions générales d&apos;utilisation
                </Link>
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
    const isPelico = user?.role === 'admin' || user?.role === 'mediator';

    const avatar = <Avatar user={user} classroom={classroom} isPelico={isPelico} size="sm" isLink={false} />;

    let { data: activityTypes = [] } = useSWR<ActivityType[]>(phase !== null ? `/api/activities/types?phase=${phase}` : null, jsonFetcher, {
        keepPreviousData: true,
    });

    const activityMenuItems = activityTypes
        .map((type) =>
            getActivityMenuItem(type, firstPath, () => {
                onClose();
            }),
        )
        .filter((item) => item !== null);
    if (activityMenuItems.length > 0) {
        activityMenuItems[0].hasSeparatorTop = true;
    }

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
                                isMystery={village.activePhase === 1 && !isPelico}
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
                        isPelico,
                    ),
                    ...activityMenuItems,
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
                    ...(user?.role === 'admin'
                        ? [
                              {
                                  icon: <MixerHorizontalIcon />,
                                  label: 'Paramètres',
                                  href: '/parametres',
                                  isActive: firstPath === 'parametres',
                                  onClick: () => {
                                      onClose();
                                  },
                              },
                          ]
                        : []),
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
            <Link href={'/cgu'} className={classNames(styles.cguLink)} onClick={() => onClose()}>
                Conditions générales d&apos;utilisation
            </Link>
        </div>
    );
};
