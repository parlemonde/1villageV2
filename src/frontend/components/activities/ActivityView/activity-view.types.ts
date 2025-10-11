import type { Activity } from '@server/database/schemas/activities';

export interface ActivityContentViewProps {
    activity: Partial<Activity>;
}
