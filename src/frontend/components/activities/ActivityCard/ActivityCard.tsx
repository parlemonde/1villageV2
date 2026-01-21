'use client';

import { ActivityHeader } from '@frontend/components/activities/ActivityHeader';
import type { Activity } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import classNames from 'clsx';

import styles from './activity-card.module.css';
import type { ActivityContentCardProps } from './activity-card.types';
import { FreeContentCard } from './cards/FreeContentCard';
import { HintCard } from './cards/HintCard';

const EmptyContentCard = () => {
    return null;
};

const CONTENT_CARDS: Record<ActivityType, React.FC<ActivityContentCardProps>> = {
    libre: FreeContentCard,
    indice: HintCard,
    jeu: EmptyContentCard,
    enigme: EmptyContentCard,
    histoire: EmptyContentCard,
};

interface ActivityCardProps {
    activity: Partial<Activity>;
    user?: User;
    classroom?: Classroom;
    onEdit?: () => void;
    onDelete?: () => void;
    shouldDisableButtons?: boolean;
}
export const ActivityCard = ({ activity, user, classroom, onEdit, onDelete, shouldDisableButtons = false }: ActivityCardProps) => {
    if (!user || !activity.type) {
        return null;
    }
    const ContentCard = CONTENT_CARDS[activity.type] || EmptyContentCard;
    return (
        <div className={classNames(styles.activityCard, { [styles.isPinned]: activity.isPinned })}>
            <ActivityHeader activity={activity} user={user} classroom={classroom} className={styles.activityCardHeader} />
            {ContentCard && (
                <div className={styles.activityCardBody}>
                    <ContentCard activity={activity} onEdit={onEdit} onDelete={onDelete} shouldDisableButtons={shouldDisableButtons} />
                </div>
            )}
        </div>
    );
};
