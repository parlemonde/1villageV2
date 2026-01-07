import { ContentViewer } from '@frontend/components/content/ContentViewer';

import type { ActivityContentViewProps } from '../activity-view.types';

export const PuzzleView = ({ activity }: ActivityContentViewProps) => {
    if (activity.type !== 'enigme') {
        return null;
    }
    return <ContentViewer content={activity.data?.content} activityId={activity.id} />;
};
