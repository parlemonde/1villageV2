'use client';

import { Avatar } from '@frontend/components/Avatar';
import { CountryFlag } from '@frontend/components/CountryFlag';
import { UserContext } from '@frontend/contexts/userContext';
import KeyIcon from '@frontend/svg/activities/enigme.svg';
import GameIcon from '@frontend/svg/activities/game.svg';
import PelicoNeutre from '@frontend/svg/pelico/pelico-neutre.svg';
import type { Activity, ActivityType } from '@server/database/schemas/activities';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import { useContext } from 'react';

import styles from './activity-card.module.css';

const TITLES: Record<ActivityType, string> = {
    libre: 'envoyé un message à ses Pélicopains',
    jeu: 'lancé un jeu',
    enigme: 'créé une énigme',
};

const ICONS: Record<ActivityType, React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>> | null> = {
    libre: GameIcon,
    jeu: GameIcon,
    enigme: KeyIcon,
};

const toDate = (date: string | null): string => {
    return date ? Intl.DateTimeFormat('fr', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(date)) : '';
};

interface ActivityDisplayNameProps {
    user: User;
    classroom?: Classroom;
    isPelico?: boolean;
}
const ActivityDisplayName = ({ user, classroom, isPelico }: ActivityDisplayNameProps) => {
    const { user: currentUser } = useContext(UserContext);
    const isSelf = user.id === currentUser.id;

    if (isPelico) {
        return 'Pélico';
    } else if (classroom && isSelf) {
        return 'Votre classe';
    } else if (classroom) {
        return `La classe${classroom.level ? ` de ${classroom.level}` : ''} à ${classroom.city}`;
    }
    return user.name;
};

interface ActivityCardProps {
    activity: Activity;
    user?: User;
    classroom?: Classroom;
}
export const ActivityCard = ({ activity, user, classroom }: ActivityCardProps) => {
    if (!user) {
        return null;
    }
    const Icon = ICONS[activity.type];
    return (
        <div className={styles.activityCard}>
            <div className={styles.activityCardHeader}>
                <Avatar user={user} classroom={classroom} isPelico={activity.isPelico} />
                <div className={styles.activityCardHeaderText}>
                    <span>
                        <ActivityDisplayName user={user} classroom={classroom} isPelico={activity.isPelico} />
                        {' a '}
                        <strong>{TITLES[activity.type]}</strong>
                    </span>
                    <div className={styles.activityCardHeaderInfo}>
                        <span>Publié le {toDate(activity.publishDate)}</span>
                        {activity.isPelico && (
                            <>
                                <span>&nbsp;&middot;&nbsp;</span>
                                <PelicoNeutre width={18} height="auto" />
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
                <span style={{ marginRight: 8 }}>{Icon && <Icon width={20} height="auto" fill="var(--primary-color)" />}</span>
            </div>
            <div className={styles.activityCardBody}>{activity.type === 'libre' ? activity.content?.text : ''}</div>
        </div>
    );
};
