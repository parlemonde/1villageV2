import type { Activity } from '@server/database/schemas/activities';
import type { CurrencyGame, GameActivity } from '@server/database/schemas/activity-types';

type ObjectData = NonNullable<CurrencyGame['objects']>[number];

export const isCurrencyGame = (activity: Partial<Activity>): activity is Activity & GameActivity<CurrencyGame> =>
    activity.type === 'jeu' && activity.data?.theme === 'monnaie';

export const currencyGameHelpers = (
    activity: Partial<GameActivity<CurrencyGame>>,
    setActivity: (activity: Partial<Activity>) => void,
    index: number,
    stepId: number,
) => {
    const setObject = <K extends keyof ObjectData>(key: K, value: ObjectData[K]) => {
        const newObjects = [...(activity.data?.objects ?? [])];
        if (index >= newObjects.length) {
            newObjects[index] = { [key]: value, stepId };
        } else {
            newObjects[index] = { ...newObjects[index], [key]: value };
        }

        setActivity({
            ...activity,
            data: {
                theme: 'monnaie',
                ...activity.data,
                objects: newObjects,
            },
        });
    };

    return {
        setObject,
    };
};
