'use client';

import type { Theme } from '@frontend/components/ThemesGrid/ThemesGrid';
import { ThemesGrid } from '@frontend/components/ThemesGrid/ThemesGrid';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import CurrencyIcon from '@frontend/svg/game/currency.svg';
import GestureIcon from '@frontend/svg/game/gesture.svg';
import IdiomIcon from '@frontend/svg/game/idiom.svg';
import type { GameType } from '@server/database/schemas/activity-types';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';

const useGameThemes = () => {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu');

    const GAME_THEMES: Theme<GameType>[] = [
        { name: 'mimique', label: t('Jeu des mimiques'), icon: <GestureIcon />, href: '/creer-un-jeu/mimique' },
        { name: 'monnaie', label: t('Jeu de la monnaie'), icon: <CurrencyIcon />, href: '/creer-un-jeu/monnaie' },
        { name: 'expression', label: t('Jeu des expressions'), icon: <IdiomIcon />, href: '/creer-un-jeu/expression' },
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
                onClick={(href) => {
                    router.push(href);
                }}
            />
        </PageContainer>
    );
}
