'use client';

import { ActivityHeader } from '@frontend/components/activities/ActivityHeader';
import type { Activity } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import classNames from 'clsx';

import styles from './activity-card.module.css';
import type { ActivityContentCardProps } from './activity-card.types';
import { ChallengeCard } from './cards/ChallengeCard';
import { FreeContentCard } from './cards/FreeContentCard';
import { GameCard } from './cards/GameCard';
import { HintCard } from './cards/HintCard';
import { MascotCard } from './cards/MascotCard';
import { ReportCard } from './cards/ReportCard';
import { QuestionCard } from './cards/QuestionCard';

const EmptyContentCard = () => {
    return null;
};

const CONTENT_CARDS: Record<ActivityType, React.FC<ActivityContentCardProps>> = {
    libre: FreeContentCard,
    indice: HintCard,
    jeu: GameCard,
    enigme: EmptyContentCard,
    reportage: ReportCard,
    mascotte: MascotCard,
    defi: ChallengeCard,
    question: QuestionCard,
};

interface ActivityCardProps {
    activity: Partial<Activity>;
    user?: User;
    classroom?: Classroom;
    onEdit?: () => void;
    onDelete?: () => void;
    shouldDisableButtons?: boolean;
    hasActions?: boolean;
}
export const ActivityCard = ({ activity, user, classroom, onEdit, onDelete, hasActions, shouldDisableButtons = false }: ActivityCardProps) => {
    if (!user || !activity.type) {
        return null;
    }
    const ContentCard = CONTENT_CARDS[activity.type] || EmptyContentCard;
    return (
        <div className={classNames(styles.activityCard, { [styles.isPinned]: activity.isPinned })}>
            <ActivityHeader showIcon activity={activity} user={user} classroom={classroom} className={styles.activityCardHeader} />
            {ContentCard && (
                <div className={styles.activityCardBody}>
                    <ContentCard
                        activity={activity}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        hasActions={hasActions}
                        shouldDisableButtons={shouldDisableButtons}
                    />
                </div>
            )}
        </div>
    );
};
