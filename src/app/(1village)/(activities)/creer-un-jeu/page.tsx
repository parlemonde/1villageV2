'use client';

import { ThemesGrid } from '@frontend/components/ThemesGrid/ThemesGrid';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import CurrencyIcon from '@frontend/svg/game/currency.svg';
import GestureIcon from '@frontend/svg/game/gesture.svg';
import IdiomIcon from '@frontend/svg/game/idiom.svg';
import { getGameFormRoutes } from '@lib/get-game-form-routes';
import type { GameType } from '@server/database/schemas/activity-types';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import type { ReactElement } from 'react';

const useGameThemes = () => {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu');

    const GAME_THEMES: { name: GameType; label: string; icon: ReactElement }[] = [
        { name: 'mimique', label: t('Jeu des mimiques'), icon: <GestureIcon /> },
        { name: 'monnaie', label: t('Jeu de la monnaie'), icon: <CurrencyIcon /> },
        { name: 'expression', label: t('Jeu des expressions'), icon: <IdiomIcon /> },
    ];

    return GAME_THEMES;
};

export default function CreerUnJeuPage() {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu');
    const gameThemes = useGameThemes();

    const router = useRouter();

    return (
        <PageContainer title={t('Choisissez le jeu que vous souhaitez créer')}>
            <ThemesGrid
                themes={gameThemes}
                onClick={(themeName) => {
                    router.push(getGameFormRoutes(themeName));
                }}
            />
        </PageContainer>
    );
}
