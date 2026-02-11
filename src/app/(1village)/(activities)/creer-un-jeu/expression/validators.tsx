import type { GameActivity, IdiomGame } from '@server/database/schemas/activity-types';

export const IDIOM_GAME_STEPS_VALIDATORS = {
    isStep1Valid(activity: Partial<GameActivity<IdiomGame>>) {
        return activity.data?.language && activity.data?.languageKnowledge;
    },

    isStep2valid(activity: Partial<GameActivity<IdiomGame>>) {
        return this.isIdiomStepValid(activity, 1);
    },

    isStep3Valid(activity: Partial<GameActivity<IdiomGame>>) {
        return this.isIdiomStepValid(activity, 2);
    },

    isStep4Valid(activity: Partial<GameActivity<IdiomGame>>) {
        return this.isIdiomStepValid(activity, 3);
    },

    areAllStepsValid(activity: Partial<GameActivity<IdiomGame>>) {
        return (
            this.isStep1Valid(activity) &&
            this.isIdiomStepValid(activity, 1) &&
            this.isIdiomStepValid(activity, 2) &&
            this.isIdiomStepValid(activity, 3)
        );
    },

    isIdiomStepValid(activity: Partial<GameActivity<IdiomGame>>, number: number) {
        const index = number - 1;
        return (
            activity.data?.idioms?.[index]?.imageUrl &&
            activity.data?.idioms?.[index]?.value &&
            activity.data?.idioms?.[index]?.meaning &&
            activity.data?.idioms?.[index]?.falseMeanings?.length == 2 &&
            activity.data?.idioms?.[index]?.falseMeanings?.every((falseMeaning) => !!falseMeaning)
        );
    },
};
