'use client';

import { ActivityHeader } from '@frontend/components/activities/ActivityHeader';
import { VillageContext } from '@frontend/contexts/villageContext';
import type { Activity } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
import { useContext } from 'react';

import type { ActivityContentViewProps } from './activity-view.types';
import { FreeContentView } from './views/FreeContentView';
import { HintView } from './views/HintView';
import { ReportView } from './views/ReportView';

const CONTENT_VIEWS: Record<ActivityType, React.FC<ActivityContentViewProps>> = {
    libre: FreeContentView,
    jeu: () => null,
    enigme: () => null,
    indice: HintView,
    reportage: ReportView,
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
