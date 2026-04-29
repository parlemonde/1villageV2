import { ActivityCard } from '@frontend/components/activities/ActivityCard';
import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import { ContentViewer } from '@frontend/components/content/ContentViewer';
import { VillageContext } from '@frontend/contexts/villageContext';
import type { ReactionActivityDto } from '@server/database/schemas/activity-types';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

export const ReactionView = ({ activity }: ActivityContentViewProps) => {
    const t = useExtracted('ReactionView');

    const { usersMap, classroomsMap } = useContext(VillageContext);

    const reaction = activity as ReactionActivityDto;
    if (activity.type !== 'reaction' || !reaction.data.activityBeingReacted) {
        return null;
    }

    return (
        <>
            <p style={{ marginBottom: '16px' }}>{t('Voici notre réaction à')}</p>
            <ActivityCard
                activity={reaction.data.activityBeingReacted}
                classroom={
                    reaction.data.activityBeingReacted?.classroomId ? classroomsMap[reaction.data.activityBeingReacted.classroomId] : undefined
                }
                user={usersMap[reaction.data.activityBeingReacted.userId]}
            />
            <ContentViewer content={activity.data?.content} activityId={activity.id} />
        </>
    );
};
