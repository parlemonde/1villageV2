import { ContentViewer } from '@frontend/components/content/ContentViewer';

import type { ActivityContentViewProps } from '../activity-view.types';

export const ReportView = ({ activity }: ActivityContentViewProps) => {
    if (activity.type !== 'reportage') {
        return null;
    }
    return <ContentViewer content={activity.data?.content} activityId={activity.id} />;
};
