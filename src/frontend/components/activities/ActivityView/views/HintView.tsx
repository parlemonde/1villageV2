import { ContentViewer } from '@frontend/components/content/ContentViewer';

import type { ActivityContentViewProps } from '../activity-view.types';

export const HintView = ({ activity }: ActivityContentViewProps) => {
    if (activity.type !== 'indice') {
        return null;
    }
    return <ContentViewer content={activity.data?.content} activityId={activity.id} />;
};
