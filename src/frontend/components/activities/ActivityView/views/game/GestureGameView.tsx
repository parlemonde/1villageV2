import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import type { GestureGame } from '@server/database/schemas/activity-types';
import { useExtracted } from 'next-intl';
import { useMemo } from 'react';

import type { Round } from './GameEngine';
import { GameEngine } from './GameEngine';

export const GestureGameView = ({ activity }: ActivityContentViewProps) => {
    const t = useExtracted('GestureGameView');

    const createRounds = useMemo((): Round[] | undefined => {
        if (activity.type !== 'jeu' || activity.data?.theme !== 'mimique') {
            return;
        }

        const data = activity.data as GestureGame;

        const allRounds = [];

        for (const gesture of data.gestures ?? []) {
            const roundOptions = [{ label: gesture.meaning ?? '', value: 'true' }];
            gesture.falseMeanings?.forEach((falseMeaning, index) => {
                roundOptions.push({ label: falseMeaning, value: index.toString() }); // value must be unique
            });

            allRounds.push({
                title: gesture.origin ?? '',
                videoUrl: gesture.videoUrl ?? '',
                options: roundOptions,
                questionId: gesture.stepId,
            });
        }

        return allRounds;
    }, [activity.data, activity.type]);

    if (activity.type !== 'jeu' || activity.data?.theme !== 'mimique') {
        return null;
    }

    if (createRounds && activity.id) {
        return (
            <GameEngine
                rounds={createRounds}
                gameId={activity.id}
                question={t('Que signifie cette mimique ?')}
                successMessage={t("C'est exact ! Vous avez trouvé la signification de cette mimique.")}
                errorMessage={t("Dommage ! Ce n'est pas la bonne réponse. Essayez encore !")}
            />
        );
    }
};
