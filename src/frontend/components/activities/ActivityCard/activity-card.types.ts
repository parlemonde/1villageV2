import type { Activity } from '@server/database/schemas/activities';

export type ActivityContentCardProps = {
    activity: Partial<Activity>;
    shouldDisableButtons?: boolean;
};
