import type { Activity } from '@server/database/schemas/activities';
import type { GameActivity, IdiomGame } from '@server/database/schemas/activity-types';

type IdiomData = NonNullable<IdiomGame['idioms']>[number];

export const isIdiomGame = (activity: Partial<Activity>): activity is Activity & GameActivity<IdiomGame> =>
    activity.type === 'jeu' && activity.data?.theme === 'expression';

export const idiomGameHelpers = (
    activity: Partial<GameActivity<IdiomGame>>,
    setActivity: (activity: Partial<GameActivity<IdiomGame>>) => void,
    index: number,
    stepId: number,
) => {
    const setIdiom = <K extends keyof IdiomData>(key: K, value: IdiomData[K]) => {
        const newIdioms = [...(activity.data?.idioms ?? [])];
        if (index >= newIdioms.length) {
            newIdioms[index] = { [key]: value, stepId };
        } else {
            newIdioms[index] = { ...newIdioms[index], [key]: value };
        }

        setActivity({
            ...activity,
            data: {
                theme: 'expression',
                ...activity.data,
                idioms: newIdioms,
            },
        });
    };

    return { setIdiom };
};
