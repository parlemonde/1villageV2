import type { Activity } from '@server/database/schemas/activities';
import type { ChallengeActivity, CulinaryChallenge } from '@server/database/schemas/activity-types';

type DishData = NonNullable<ChallengeActivity<CulinaryChallenge>['data']['dish']>;

export const culinaryChallengeHelpers = (
    activity: Partial<ChallengeActivity<CulinaryChallenge>>,
    setActivity: (activity: Partial<ChallengeActivity<CulinaryChallenge>>) => void,
) => {
    const setDish = <K extends keyof DishData>(key: K, value: DishData[K]) => {
        setActivity({
            ...activity,
            data: {
                ...activity.data,
                theme: 'culinaire',
                dish: {
                    ...(activity.data?.dish || {}),
                    [key]: value,
                },
            },
        });
    };

    return {
        setDish,
    };
};

export const isCulinaryChallenge = (activity: Partial<Activity>): activity is Activity & ChallengeActivity<CulinaryChallenge> =>
    activity.type === 'defi' && activity.data?.theme === 'culinaire';
