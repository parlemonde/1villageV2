import type { Activity } from '@server/database/schemas/activities';

export interface ChallengeCardProps {
    activity: Partial<Activity>;
}
