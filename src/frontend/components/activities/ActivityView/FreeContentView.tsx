import { ContentViewer } from '@frontend/components/content/ContentViewer';

import type { ActivityContentViewProps } from './activity-view.types';

export const FreeContentView = ({ activity }: ActivityContentViewProps) => {
    if (activity.type !== 'libre') {
        return null;
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '32px 0' }}>
            {(activity.data?.content || []).map((content, index) => (
                <ContentViewer key={index} content={content} />
            ))}
        </div>
    );
};
