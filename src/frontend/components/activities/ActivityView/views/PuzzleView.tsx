import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import { ContentViewer } from '@frontend/components/content/ContentViewer';

export const PuzzleView = ({ activity }: ActivityContentViewProps) => {
    if (activity.type !== 'enigme') {
        return null;
    }
    return <ContentViewer content={activity.data?.content} activityId={activity.id} />;
};
