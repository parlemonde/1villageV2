import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import type { IdiomGame } from '@server/database/schemas/activity-types';
import { useExtracted } from 'next-intl';
import { useMemo } from 'react';

import type { Round } from './GameEngine';
import { GameEngine } from './GameEngine';

export const IdiomGameView = ({ activity }: ActivityContentViewProps) => {
    const t = useExtracted('IdiomGameView');

    const createRounds = useMemo((): Round[] | undefined => {
        if (activity.type !== 'jeu' || activity.data?.theme !== 'expression') {
            return;
        }

        const data = activity.data as IdiomGame;

        const allRounds = [];

        for (const idiom of data.idioms ?? []) {
            const roundOptions = [{ label: idiom.meaning ?? '', value: 'true' }];
            idiom.falseMeanings?.forEach((falseMeaning, index) => {
                roundOptions.push({ label: falseMeaning, value: index.toString() }); // value must be unique
            });

            allRounds.push({
                title: idiom.value ?? '',
                imageUrl: idiom.imageUrl ?? '',
                options: roundOptions,
                questionId: idiom.stepId,
            });
        }

        return allRounds;
    }, [activity.data, activity.type]);

    if (activity.type !== 'jeu' || activity.data?.theme !== 'expression') {
        return null;
    }

    if (createRounds && activity.id) {
        return (
            <GameEngine
                rounds={createRounds}
                gameId={activity.id}
                question={t('Que signifie cette expression ?')}
                successMessage={t("C'est exact ! Vous avez trouvé la signification de cette expression.")}
                errorMessage={t("Dommage ! Ce n'est pas la bonne réponse. Essayez encore !")}
            />
        );
    }
};
