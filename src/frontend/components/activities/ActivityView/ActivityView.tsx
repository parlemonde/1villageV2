'use client';

import { ActivityHeader } from '@frontend/components/activities/ActivityHeader';
import { UserViews } from '@frontend/components/activities/Reactions/UserViews';
import { Comments } from '@frontend/components/comments/Comments';
import { VillageContext } from '@frontend/contexts/villageContext';
import type { Activity } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import type { ActivityContentViewProps } from './activity-view.types';
import styles from './activity-views.module.css';
import { ChallengeView } from './views/ChallengeView';
import { FreeContentView } from './views/FreeContentView';
import { GameView } from './views/GameView';
import { HintView } from './views/HintView';
import { MascotView } from './views/MascotView';
import { PuzzleView } from './views/PuzzleView';
import { QuestionView } from './views/QuestionView';
import { ReportView } from './views/ReportView';

const CONTENT_VIEWS: Record<ActivityType, React.FC<ActivityContentViewProps>> = {
    libre: FreeContentView,
    jeu: GameView,
    enigme: PuzzleView,
    indice: HintView,
    reportage: ReportView,
    histoire: () => null,
    mascotte: MascotView,
    defi: ChallengeView,
    question: QuestionView,
    'presentation-pelico': FreeContentView,
    hymne: () => null,
};

interface ActivityViewProps {
    activity: Activity;
    showDetails?: boolean;
}
export const ActivityView = ({ activity, showDetails = true }: ActivityViewProps) => {
    const { usersMap, classroomsMap } = useContext(VillageContext);
    const t = useExtracted('ActivityView');

    if (!activity) return null;

    const ContentView = CONTENT_VIEWS[activity.type];
    return (
        <>
            <ActivityHeader
                activity={activity}
                user={usersMap[activity.userId]}
                classroom={activity.classroomId !== null ? classroomsMap[activity.classroomId] : undefined}
                showDetails={showDetails}
            />
            {showDetails && ContentView && <ContentView activity={activity} />}
            {showDetails && (
                <div className={styles.separator}>
                    <strong>{t('Réaction des pélicopains')}</strong>
                </div>
            )}
            {showDetails && <UserViews activity={activity} />}
            {showDetails && <Comments activityId={activity.id} />}
        </>
    );
};
