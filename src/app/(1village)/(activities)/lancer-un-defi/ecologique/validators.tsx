import type { ChallengeActivity, EcologicalChallenge } from '@server/database/schemas/activity-types';

export const ECOLOGICAL_CHALLENGE_VALIDATORS = {
    isStep1Valid(activity: Partial<ChallengeActivity<EcologicalChallenge>>) {
        return activity?.data?.action;
    },

    isStep2Valid(activity: Partial<ChallengeActivity<EcologicalChallenge>>) {
        return activity?.data?.content && activity?.data?.content.length > 0;
    },

    isStep3Valid(activity: Partial<ChallengeActivity<EcologicalChallenge>>) {
        return activity?.data?.challengeKind;
    },

    areAllStepsValid(activity: Partial<ChallengeActivity<EcologicalChallenge>>) {
        return this.isStep1Valid(activity) && this.isStep2Valid(activity) && this.isStep3Valid(activity);
    },
};
