import type { Activity } from '@server/database/schemas/activities';
import type { GameActivity, GestureGame } from '@server/database/schemas/activity-types';

type GestureData = NonNullable<GestureGame['gestures']>[number];

export const isGestureGame = (activity: Partial<Activity>): activity is Activity & GameActivity<GestureGame> =>
    activity.type === 'jeu' && activity.data?.theme === 'mimique';

export const gestureGameHelpers = (
    activity: Partial<GameActivity<GestureGame>>,
    setActivity: (activity: Partial<Activity>) => void,
    index: number,
    stepId: number,
) => {
    const setGesture = <K extends keyof GestureData>(key: K, value: GestureData[K]) => {
        const newGestures = [...(activity.data?.gestures ?? [])];
        if (index >= newGestures.length) {
            newGestures[index] = { [key]: value, stepId };
        } else {
            newGestures[index] = { ...newGestures[index], [key]: value };
        }

        setActivity({
            ...activity,
            data: {
                theme: 'mimique',
                ...activity.data,
                gestures: newGestures,
            },
        });
    };

    return {
        setGesture,
    };
};
