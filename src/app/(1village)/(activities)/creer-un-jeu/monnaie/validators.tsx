import type { CurrencyGame, GameActivity } from '@server/database/schemas/activity-types';

export const CURRENCY_GAME_STEPS_VALIDATORS = {
    isStep1Valid(activity: Partial<GameActivity<CurrencyGame>>) {
        return activity.data?.currency;
    },

    isStep2Valid(activity: Partial<GameActivity<CurrencyGame>>) {
        return this.isObjectStepValid(activity, 1);
    },

    isStep3Valid(activity: Partial<GameActivity<CurrencyGame>>) {
        return this.isObjectStepValid(activity, 2);
    },

    isStep4Valid(activity: Partial<GameActivity<CurrencyGame>>) {
        return this.isObjectStepValid(activity, 3);
    },

    areAllStepsValid(activity: Partial<GameActivity<CurrencyGame>>) {
        return this.isStep1Valid(activity) && this.isStep2Valid(activity) && this.isStep3Valid(activity) && this.isStep4Valid(activity);
    },

    isObjectStepValid(activity: Partial<GameActivity<CurrencyGame>>, number: number) {
        const index = number - 1;
        return (
            activity.data?.objects?.[index]?.imageUrl &&
            activity.data?.objects?.[index]?.name &&
            activity.data?.objects?.[index]?.price &&
            activity.data?.objects?.[index]?.falsePrices?.length == 2 &&
            activity.data?.objects?.[index]?.falsePrices?.every((falsePrice) => !!falsePrice)
        );
    },
};
