import type { ReactionActivityDao } from '@server/database/schemas/activity-types';

export const isReactionStep1Valid = (activity: Partial<ReactionActivityDao>) => {
    return activity.data?.activityId && activity.data?.activityId > 0;
};

export const isReactionStep2Valid = (activity: Partial<ReactionActivityDao>) => {
    return activity.data?.content && activity.data?.content?.length > 0;
};

export const isReactionFormValid = (activity: Partial<ReactionActivityDao>) => {
    return isReactionStep1Valid(activity) && isReactionStep2Valid(activity);
};
