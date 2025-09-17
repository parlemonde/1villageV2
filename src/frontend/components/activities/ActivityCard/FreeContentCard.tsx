import { Button } from '@frontend/components/ui/Button';

import type { ActivityContentCardProps } from './activity-card.types';

export const FreeContentCard = ({ activity }: ActivityContentCardProps) => {
    if (activity.type !== 'libre') {
        return null;
    }
    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px' }}>
                <span style={{ fontWeight: 500 }}>{activity.data?.title}</span>
                <p style={{ fontSize: '15px' }}>{activity.data?.resume}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
                <Button
                    as="a"
                    href={`/activities/${activity.id}`}
                    color="primary"
                    variant="outlined"
                    label={activity.isPelico ? 'Voir le message de Pélico' : 'Voir le message'}
                />
            </div>
        </div>
    );
};
