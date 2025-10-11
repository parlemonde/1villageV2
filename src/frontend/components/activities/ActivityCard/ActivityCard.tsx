'use client';

import type { Activity, ActivityType } from '@server/database/schemas/activities';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import classNames from 'clsx';

import { FreeContentCard } from './FreeContentCard';
import styles from './activity-card.module.css';
import type { ActivityContentCardProps } from './activity-card.types';
import { ActivityHeader } from '../ActivityHeader';

const CONTENT_CARDS: Record<ActivityType, React.FC<ActivityContentCardProps>> = {
    libre: FreeContentCard,
    jeu: () => null,
    enigme: () => null,
};

interface ActivityCardProps {
    activity: Partial<Activity>;
    user?: User;
    classroom?: Classroom;
    shouldDisableButtons?: boolean;
}
export const ActivityCard = ({ activity, user, classroom, shouldDisableButtons }: ActivityCardProps) => {
    if (!user || !activity.type) {
        return null;
    }
    const ContentCard = CONTENT_CARDS[activity.type] || (() => null);
    return (
        <div className={classNames(styles.activityCard, { [styles.isPinned]: activity.isPinned })}>
            <ActivityHeader activity={activity} user={user} classroom={classroom} className={styles.activityCardHeader} />
            {ContentCard && (
                <div className={styles.activityCardBody}>{<ContentCard activity={activity} shouldDisableButtons={shouldDisableButtons} />}</div>
            )}
        </div>
    );
};
