'use client';

import { ActivityHeader } from '@frontend/components/activities/ActivityHeader';
import { VillageContext } from '@frontend/contexts/villageContext';
import type { Activity, ActivityType } from '@server/database/schemas/activities';
import { useContext } from 'react';

import { FreeContentView } from './FreeContentView';
import type { ActivityContentViewProps } from './activity-view.types';

const CONTENT_VIEWS: Record<ActivityType, React.FC<ActivityContentViewProps>> = {
    libre: FreeContentView,
    jeu: () => null,
    enigme: () => null,
};

interface ActivityViewProps {
    activity: Activity;
}
export const ActivityView = ({ activity }: ActivityViewProps) => {
    const { usersMap, classroomsMap } = useContext(VillageContext);
    const ContentView = CONTENT_VIEWS[activity.type];
    return (
        <div>
            <ActivityHeader
                activity={activity}
                user={usersMap[activity.userId]}
                classroom={activity.classroomId !== null ? classroomsMap[activity.classroomId] : undefined}
            />
            {ContentView && <ContentView activity={activity} />}
        </div>
    );
};
