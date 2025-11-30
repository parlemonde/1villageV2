'use client';

import { Avatar } from '@frontend/components/Avatar';
import { CountryFlag } from '@frontend/components/CountryFlag';
import { UserContext } from '@frontend/contexts/userContext';
import KeyIcon from '@frontend/svg/activities/enigme.svg';
import GameIcon from '@frontend/svg/activities/game.svg';
import PinnedIcon from '@frontend/svg/activities/pinned.svg';
import PelicoNeutre from '@frontend/svg/pelico/pelico-neutre.svg';
import type { Activity } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import classNames from 'clsx';
import { useContext } from 'react';

import styles from './activity-header.module.css';

const TITLES: Record<ActivityType, string> = {
    libre: 'envoyé un message à ses Pélicopains',
    jeu: 'lancé un jeu',
    enigme: 'créé une énigme',
};

const ICONS: Record<ActivityType, React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>> | null> = {
    libre: null,
    jeu: GameIcon,
    enigme: KeyIcon,
};

const toFormattedDate = (date: string | null): string => {
    return date ? Intl.DateTimeFormat('fr', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(date)) : '';
};

interface ActivityDisplayNameProps {
    user?: User;
    classroom?: Classroom;
    isPelico?: boolean;
}
const ActivityDisplayName = ({ user, classroom, isPelico }: ActivityDisplayNameProps) => {
    const { classroom: currentClassroom } = useContext(UserContext);

    if (isPelico) {
        return 'Pélico';
    } else if (classroom && classroom.id === currentClassroom?.id) {
        return 'Votre classe';
    } else if (classroom) {
        return `La classe${classroom.level ? ` de ${classroom.level}` : ''} à ${classroom.city}`;
    }
    return user?.name || 'Un pélicopain';
};

interface ActivityHeaderProps {
    activity: Partial<Activity>;
    user?: User;
    classroom?: Classroom;
    className?: string;
}
export const ActivityHeader = ({ user, classroom, activity, className }: ActivityHeaderProps) => {
    if (!activity.type) {
        return null;
    }
    const Icon = activity.isPinned ? PinnedIcon : ICONS[activity.type];
    return (
        <div className={classNames(styles.activityHeader, className)}>
            <Avatar user={user} classroom={classroom} isPelico={activity.isPelico} />
            <div className={styles.activityHeaderText}>
                <span>
                    <ActivityDisplayName user={user} classroom={classroom} isPelico={activity.isPelico} />
                    {' a '}
                    <strong>{TITLES[activity.type]}</strong>
                </span>
                <div className={styles.activityHeaderInfo}>
                    <span>Publié le {toFormattedDate(activity.publishDate ?? null)}</span>
                    {activity.isPelico && (
                        <>
                            <span>&nbsp;&middot;&nbsp;</span>
                            <PelicoNeutre style={{ width: '18px', height: 'auto' }} />
                        </>
                    )}
                    {classroom && (
                        <>
                            <span>&nbsp;&middot;&nbsp;</span>
                            <CountryFlag size="small" country={classroom?.countryCode} />
                        </>
                    )}
                </div>
            </div>
            {Icon && <Icon style={{ width: '20px', height: 'auto', marginRight: 8 }} fill="var(--primary-color)" />}
        </div>
    );
};
