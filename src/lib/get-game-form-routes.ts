import type { GameType } from '@server/database/schemas/activity-types';

export const getGameFormRoutes = (gameType: GameType) => {
    if (!gameType) {
        return '/creer-un-jeu';
    }

    const routes: Record<GameType, string> = {
        mimique: '/creer-un-jeu/mimique',
        monnaie: '/creer-un-jeu/monnaie',
        expression: '/creer-un-jeu/expression',
    };

    return routes[gameType];
};
