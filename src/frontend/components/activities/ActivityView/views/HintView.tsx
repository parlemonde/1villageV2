import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import { ContentViewer } from '@frontend/components/content/ContentViewer';

export const HintView = ({ activity }: ActivityContentViewProps) => {
    if (activity.type !== 'indice') {
        return null;
    }
    return <ContentViewer content={activity.data?.content} activityId={activity.id} />;
};
