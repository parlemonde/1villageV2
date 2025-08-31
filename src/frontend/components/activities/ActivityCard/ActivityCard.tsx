'use client';

import type { Activity, ActivityType } from '@server/database/schemas/activities';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';

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
    activity: Activity;
    user?: User;
    classroom?: Classroom;
}
export const ActivityCard = ({ activity, user, classroom }: ActivityCardProps) => {
    if (!user) {
        return null;
    }
    const ContentCard = CONTENT_CARDS[activity.type] || (() => null);
    return (
        <div className={styles.activityCard}>
            <ActivityHeader activity={activity} user={user} classroom={classroom} className={styles.activityCardHeader} />
            {ContentCard && <div className={styles.activityCardBody}>{<ContentCard activity={activity} />}</div>}
        </div>
    );
};
