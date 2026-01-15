'use client';

import { Avatar } from '@frontend/components/Avatar';
import { CountryFlag } from '@frontend/components/CountryFlag';
import { ACTIVITY_CARD_TITLES, ACTIVITY_ICONS } from '@frontend/components/activities/activities-constants';
import { UserContext } from '@frontend/contexts/userContext';
import PinnedIcon from '@frontend/svg/activities/pinned.svg';
import PelicoNeutre from '@frontend/svg/pelico/pelico-neutre.svg';
import type { Activity } from '@server/database/schemas/activities';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import classNames from 'clsx';
import { useContext } from 'react';

import styles from './activity-header.module.css';

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
        return classroom.alias || (classroom.level ? `Les ${classroom.level} de ${classroom.name}` : classroom.name);
    }
    return user?.name || 'Un pélicopain';
};

interface ActivityHeaderProps {
    activity: Partial<Activity>;
    user?: User;
    classroom?: Classroom;
    className?: string;
    showIcon?: boolean;
    showDetails?: boolean;
}
export const ActivityHeader = ({ user, classroom, activity, className, showIcon, showDetails = true }: ActivityHeaderProps) => {
    if (!activity.type) {
        return null;
    }
    const Icon = activity.isPinned ? PinnedIcon : ACTIVITY_ICONS[activity.type];
    return (
        <div className={classNames(styles.activityHeader, className)}>
            <Avatar user={user} classroom={classroom} isPelico={activity.isPelico} />
            <div className={styles.activityHeaderText}>
                <span>
                    <ActivityDisplayName user={user} classroom={classroom} isPelico={activity.isPelico} />
                    {showDetails && (
                        <>
                            {' a '}
                            <strong>{ACTIVITY_CARD_TITLES[activity.type]}</strong>
                        </>
                    )}
                </span>
                {showDetails && (
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
                )}
            </div>
            {showDetails && showIcon && Icon && <Icon style={{ width: '30px', height: 'auto', marginRight: 8, color: 'var(--primary-color)' }} />}
        </div>
    );
};
