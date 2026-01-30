import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import type { IdiomGame } from '@server/database/schemas/activity-types';
import { useMemo } from 'react';

import type { Round } from './GameEngine';
import { GameEngine } from './GameEngine';

export const IdiomGameView = ({ activity }: ActivityContentViewProps) => {
    const createRounds = useMemo((): Round[] => {
        if (activity.type !== 'jeu' || activity.data?.theme !== 'expression') {
            return [];
        }

        const data = activity.data as IdiomGame;

        const allRounds = [];

        for (const idiom of data.idioms ?? []) {
            const roundOptions = [{ label: idiom.meaning ?? '', value: 'true' }];
            idiom.falseMeanings?.forEach((falseMeaning, index) => {
                roundOptions.push({ label: falseMeaning, value: index.toString() }); // value must be unique
            });

            allRounds.push({
                question: idiom.value ?? '',
                imageUrl: idiom.imageUrl ?? '',
                options: roundOptions,
            });
        }

        return allRounds;
    }, [activity.data, activity.type]);

    if (activity.type !== 'jeu' || activity.data?.theme !== 'expression') {
        return null;
    }

    return <GameEngine rounds={createRounds} />;
};
