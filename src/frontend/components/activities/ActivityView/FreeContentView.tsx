import { ContentViewer } from '@frontend/components/content/ContentViewer';

import type { ActivityContentViewProps } from './activity-view.types';

export const FreeContentView = ({ activity }: ActivityContentViewProps) => {
    if (activity.type !== 'libre') {
        return null;
    }
    return <ContentViewer content={activity.data?.content} activityId={activity.id} />;
};
