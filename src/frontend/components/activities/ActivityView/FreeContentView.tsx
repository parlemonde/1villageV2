import { HtmlViewer } from '@frontend/components/html/HtmlViewer';

import type { ActivityContentViewProps } from './activity-view.types';

export const FreeContentView = ({ activity }: ActivityContentViewProps) => {
    if (activity.type !== 'libre') {
        return null;
    }
    return (
        <div style={{ padding: '32px 0' }}>
            <HtmlViewer content={activity.content?.text} />
        </div>
    );
};
