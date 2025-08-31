import { Title } from '@frontend/components/ui/Title';

import type { ActivityContentViewProps } from './activity-view.types';

export const FreeContentView = ({ activity }: ActivityContentViewProps) => {
    if (activity.type !== 'libre') {
        return null;
    }
    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px' }}>
                <Title variant="h3" marginY="md">
                    {activity.content?.title}
                </Title>
                <span>{activity.content?.text}</span>
            </div>
        </div>
    );
};
