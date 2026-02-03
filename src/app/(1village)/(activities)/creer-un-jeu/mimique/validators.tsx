import type { GameActivity, GestureGame } from '@server/database/schemas/activity-types';

export const GESTURE_GAME_STEPS_VALIDATORS = {
    isStep1Valid(activity: Partial<GameActivity<GestureGame>>) {
        return this.isGestureFormValid(activity, 1);
    },

    isStep2Valid(activity: Partial<GameActivity<GestureGame>>) {
        return this.isGestureFormValid(activity, 2);
    },

    isStep3Valid(activity: Partial<GameActivity<GestureGame>>) {
        return this.isGestureFormValid(activity, 3);
    },

    areAllStepsValid(activity: Partial<GameActivity<GestureGame>>) {
        return this.isStep1Valid(activity) && this.isStep2Valid(activity) && this.isStep3Valid(activity);
    },

    isGestureFormValid(activity: Partial<GameActivity<GestureGame>>, number: number) {
        const index = number - 1;
        return (
            activity.data?.gestures?.[index]?.videoUrl &&
            activity.data?.gestures?.[index]?.meaning &&
            activity.data?.gestures?.[index]?.origin &&
            activity.data?.gestures?.[index]?.falseMeanings?.length == 2 &&
            activity.data?.gestures?.[index]?.falseMeanings?.every((falseMeaning) => !!falseMeaning)
        );
    },
};
