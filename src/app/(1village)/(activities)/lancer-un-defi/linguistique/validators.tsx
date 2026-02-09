import type { ChallengeActivity, LinguisticChallenge } from '@server/database/schemas/activity-types';

export const LINGUISTIC_CHALLENGE_VALIDATORS = {
    isStep1Valid(activity: Partial<ChallengeActivity<LinguisticChallenge>>) {
        return activity?.data?.language && activity?.data?.languageKnowledge;
    },

    isStep2Valid(activity: Partial<ChallengeActivity<LinguisticChallenge>>) {
        return activity?.data?.textKind;
    },

    isStep3Valid(activity: Partial<ChallengeActivity<LinguisticChallenge>>) {
        return activity?.data?.content && activity?.data?.content.length > 0;
    },

    isStep4Valid(activity: Partial<ChallengeActivity<LinguisticChallenge>>) {
        return activity?.data?.challengeKind;
    },

    areAllStepsValid(activity: Partial<ChallengeActivity<LinguisticChallenge>>) {
        return this.isStep1Valid(activity) && this.isStep2Valid(activity) && this.isStep3Valid(activity) && this.isStep4Valid(activity);
    },
};
