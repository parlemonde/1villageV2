'use client';

import { ActivityHeader } from '@frontend/components/activities/ActivityHeader';
import { VillageContext } from '@frontend/contexts/villageContext';
import type { Activity } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
import { useContext } from 'react';

import type { ActivityContentViewProps } from './activity-view.types';
import { FreeContentView } from './views/FreeContentView';

const CONTENT_VIEWS: Record<ActivityType, React.FC<ActivityContentViewProps>> = {
    libre: FreeContentView,
    jeu: () => null,
    enigme: () => null,
};

interface ActivityViewProps {
    activity: Activity;
    showDetails?: boolean;
}
export const ActivityView = ({ activity, showDetails = true }: ActivityViewProps) => {
    const { usersMap, classroomsMap } = useContext(VillageContext);
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
        </>
    );
};
