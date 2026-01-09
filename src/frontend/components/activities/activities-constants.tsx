'use client';

import EnigmeIcon from '@frontend/svg/activities/enigme.svg';
import FreeContentIcon from '@frontend/svg/activities/free-content.svg';
import GameIcon from '@frontend/svg/activities/game.svg';
import HintIcon from '@frontend/svg/activities/hint.svg';
import ReportageIcon from '@frontend/svg/activities/reportage.svg';
import type { ActivityType } from '@server/database/schemas/activity-types';
import { useExtracted } from 'next-intl';
import React from 'react';

export const useActivityName = () => {
    const t = useExtracted('activities-constants');
    const getActivityName = React.useCallback(
        (type: ActivityType): string => {
            switch (type) {
                case 'libre':
                    return t('Contenu libre');
                case 'jeu':
                    return t('Jeu');
                case 'enigme':
                    return t('Énigme');
                case 'indice':
                    return t('Indice');
                case 'reportage':
                    return t('Reportage');
            }
        },
        [t],
    );
    return { getActivityName };
};
export const ActivityName = ({ type }: { type: ActivityType }): React.ReactNode => {
    const { getActivityName } = useActivityName();
    return getActivityName(type);
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
    libre: 'Publier un contenu libre',
    jeu: 'Créer un jeu',
    enigme: 'Créer une énigme',
    indice: 'Créer un indice',
    mascotte: 'Créer la mascotte',
    reportage: 'Créer un reportage',
};

export const ACTIVITY_CARD_TITLES: Record<ActivityType, string> = {
    libre: 'envoyé un message à ses Pélicopains',
    jeu: 'lancé un jeu',
    enigme: 'créé une énigme',
    indice: 'créé un indice',
    mascotte: 'créé la mascotte',
    reportage: 'créé un reportage',
};

export const ACTIVITY_ICONS: Record<ActivityType, React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>> | null> = {
    libre: FreeContentIcon,
    jeu: GameIcon,
    enigme: EnigmeIcon,
    indice: HintIcon,
    mascotte: null,
    reportage: ReportageIcon,
};

export const ACTIVITY_URLS: Record<ActivityType, string> = {
    libre: '/contenu-libre',
    jeu: '/creer-un-jeu',
    enigme: '/creer-une-enigme',
    indice: '/creer-un-indice',
    mascotte: '/creer-la-mascotte',
    reportage: '/creer-un-reportage',
};

export const ACTIVITY_LAST_PAGE_URLS: Record<ActivityType, string> = {
    libre: '/contenu-libre/3',
    jeu: '/creer-un-jeu/3',
    enigme: '/creer-une-enigme/3',
    indice: '/creer-un-indice/3',
    mascotte: '/creer-la-mascotte/5',
    reportage: '/creer-un-reportage/3',
};
