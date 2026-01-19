import type { Activity } from '@server/database/schemas/activities';
import type { ChallengeActivity, LinguisticChallenge } from '@server/database/schemas/activity-types';

export const isLinguisticActivity = (activity: Partial<Activity>): activity is Activity & ChallengeActivity<LinguisticChallenge> =>
    activity.type === 'defi' && activity.data?.theme === 'linguistique';
