import type { Activity } from '@server/database/schemas/activities';
import type { ChallengeActivity, EcologicalChallenge } from '@server/database/schemas/activity-types';

export const isEcologicalChallenge = (activity: Partial<Activity>): activity is Activity & ChallengeActivity<EcologicalChallenge> =>
    activity.type === 'defi' && activity.data?.theme === 'ecologique';
