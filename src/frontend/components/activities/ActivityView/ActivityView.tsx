'use client';

import { ActivityHeader } from '@frontend/components/activities/ActivityHeader';
import { Comments } from '@frontend/components/comments/Comments';
import { VillageContext } from '@frontend/contexts/villageContext';
import { getClassroomFromMap } from '@lib/get-classroom';
import type { Activity } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
import { useContext } from 'react';

import type { ActivityContentViewProps } from './activity-view.types';
import { ChallengeView } from './views/ChallengeView';
import { FreeContentView } from './views/FreeContentView';
import { GameView } from './views/GameView';
import { HintView } from './views/HintView';
import { MascotView } from './views/MascotView';
import { PuzzleView } from './views/PuzzleView';
import { ReportView } from './views/ReportView';

const CONTENT_VIEWS: Record<ActivityType, React.FC<ActivityContentViewProps>> = {
    libre: FreeContentView,
    jeu: GameView,
    enigme: PuzzleView,
    indice: HintView,
    reportage: ReportView,
    mascotte: MascotView,
    defi: ChallengeView,
};

interface ActivityViewProps {
    activity: Activity;
    showDetails?: boolean;
}
export const ActivityView = ({ activity, showDetails = true }: ActivityViewProps) => {
    const { usersMap, classroomsMap } = useContext(VillageContext);

    if (!activity) return null;

    const ContentView = CONTENT_VIEWS[activity.type];
    return (
        <>
            <ActivityHeader
                activity={activity}
                user={usersMap[activity.userId]}
                classroom={getClassroomFromMap(classroomsMap, activity.classroomId)}
                showDetails={showDetails}
            />
            {showDetails && ContentView && <ContentView activity={activity} />}
            {showDetails && <Comments activityId={activity.id} />}
        </>
    );
};
