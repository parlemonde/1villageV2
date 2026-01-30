'use client';

import ChallengeIcon from '@frontend/svg/activities/challenge.svg';
import EnigmeIcon from '@frontend/svg/activities/enigme.svg';
import FreeContentIcon from '@frontend/svg/activities/free-content.svg';
import GameIcon from '@frontend/svg/activities/game.svg';
import HintIcon from '@frontend/svg/activities/hint.svg';
import MascotIcon from '@frontend/svg/activities/mascot.svg';
import ReportageIcon from '@frontend/svg/activities/reportage.svg';
import type { ActivityType } from '@server/database/schemas/activity-types';
import type { UserRole } from '@server/database/schemas/users';
import type { ActivityType, GameType } from '@server/database/schemas/activity-types';
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
                case 'mascotte':
                    return t('Mascotte');
                case 'defi':
                    return t('Défi');
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
    mascotte: 'Créer sa mascotte',
    reportage: 'Créer un reportage',
    defi: 'Lancer un defi',
};

export const ACTIVITY_CARD_TITLES: Record<ActivityType, string> = {
    libre: 'envoyé un message à ses Pélicopains',
    jeu: 'lancé un jeu',
    enigme: 'créé une énigme',
    indice: 'créé un indice',
    mascotte: 'créé sa mascotte',
    reportage: 'créé un reportage',
    defi: 'lancé un defi',
};

export const ACTIVITY_ICONS: Record<ActivityType, React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>> | null> = {
    libre: FreeContentIcon,
    jeu: GameIcon,
    enigme: EnigmeIcon,
    indice: HintIcon,
    mascotte: MascotIcon,
    reportage: ReportageIcon,
    defi: ChallengeIcon,
};

export const ACTIVITY_URLS: Record<ActivityType, string> = {
    libre: '/contenu-libre',
    jeu: '/creer-un-jeu',
    enigme: '/creer-une-enigme',
    indice: '/creer-un-indice',
    mascotte: '/creer-sa-mascotte',
    reportage: '/creer-un-reportage',
    defi: '/lancer-un-defi',
};

type ActivityRoute = string | ((theme: GameType) => string);
export const ACTIVITY_LAST_PAGE_URLS: Record<ActivityType, ActivityRoute> = {
    libre: '/contenu-libre/3',
    jeu: (theme: GameType) => {
        switch (theme) {
            case 'expression':
                return '/creer-un-jeu/expression/5';
            case 'mimique':
                return '/creer-un-jeu/mimique/5';
            case 'monnaie':
                return '/creer-un-jeu/monnaie/5';
        }
    },
    enigme: '/creer-une-enigme/3',
    indice: '/creer-un-indice/3',
    mascotte: '/creer-sa-mascotte/5',
    reportage: '/creer-un-reportage/3',
    defi: '/lancer-un-defi/3',
};

// null means all roles
export const ACTIVITY_ROLES: Record<ActivityType, UserRole[] | null> = {
    libre: null,
    jeu: null,
    enigme: null,
    indice: null,
    reportage: null,
    mascotte: ['teacher'],
    defi: null,
};

export const getActivityLastPageUrl = (type: ActivityType, theme?: GameType) => {
    const route = ACTIVITY_LAST_PAGE_URLS[type];

    if (typeof route === 'string') {
        return route;
    }

    if (theme) {
        return route(theme);
    }

    return '/';
};
