import type { ChallengeActivity, CulinaryChallenge } from '@server/database/schemas/activity-types';

export const CULINARY_CHALLENGE_VALIDATORS = {
    isStep1Valid(activity: Partial<ChallengeActivity<CulinaryChallenge>>) {
        return activity.data?.dish?.imageUrl && activity.data?.dish?.name && activity.data?.dish?.history && activity.data?.dish?.description;
    },

    isStep2Valid(activity: Partial<ChallengeActivity<CulinaryChallenge>>) {
        return activity.data?.content && activity.data?.content.length > 0;
    },

    isStep3Valid(activity: Partial<ChallengeActivity<CulinaryChallenge>>) {
        return activity.data?.challengeKind;
    },

    areAllStepsValid(activity: Partial<ChallengeActivity<CulinaryChallenge>>) {
        return this.isStep1Valid(activity) && this.isStep2Valid(activity) && this.isStep3Valid(activity);
    },
};
