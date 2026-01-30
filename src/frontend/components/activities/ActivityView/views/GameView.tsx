import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import type { GameType } from '@server/database/schemas/activity-types';
import type React from 'react';

import { IdiomGameView } from './game/IdiomGameView';

const GAME_VIEWS: Record<GameType, React.FC<ActivityContentViewProps>> = {
    expression: IdiomGameView,
    mimique: () => null,
    monnaie: () => null,
};

export const GameView = ({ activity }: ActivityContentViewProps) => {
    if (activity.type !== 'jeu' || !activity.data?.theme) {
        return null;
    }

    const GameView = GAME_VIEWS[activity.data.theme];
    if (GameView) {
        return <GameView activity={activity} />;
    }
};
