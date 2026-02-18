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
                case 'mascotte':
                    return t('Mascotte');
                case 'defi':
                    return t('Défi');
                case 'question':
                    return t('Question');
            }
        },
        [t],
    );
    const getActivityLabel = React.useCallback(
        (type: ActivityType): string => {
            switch (type) {
                case 'libre':
                    return t('Publier un contenu libre');
                case 'jeu':
                    return t('Créer un jeu');
                case 'enigme':
                    return t('Créer une énigme');
                case 'indice':
                    return t('Créer un indice');
                case 'reportage':
                    return t('Créer un reportage');
                case 'mascotte':
                    return t('Créer sa mascotte');
                case 'defi':
                    return t('Lancer un defi');
                case 'question':
                    return t('Poser une question');
            }
        },
        [t],
    );
    return { getActivityName, getActivityLabel };
};
export const ActivityName = ({ type }: { type: ActivityType }): React.ReactNode => {
    const { getActivityName } = useActivityName();
    return getActivityName(type);
};

export const ACTIVITY_CARD_TITLES: Record<ActivityType, string> = {
    libre: 'envoyé un message à ses Pélicopains',
    jeu: 'lancé un jeu',
    enigme: 'créé une énigme',
    indice: 'créé un indice',
    reportage: 'créé un reportage',
};

export const ACTIVITY_ICONS: Record<ActivityType, React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>> | null> = {
    libre: FreeContentIcon,
    jeu: GameIcon,
    enigme: EnigmeIcon,
    indice: HintIcon,
    reportage: ReportageIcon,
};

export const ACTIVITY_URLS: Record<ActivityType, string> = {
    libre: '/contenu-libre',
    jeu: '/creer-un-jeu',
    enigme: '/creer-une-enigme',
    indice: '/creer-un-indice',
    reportage: '/creer-un-reportage',
};

export const ACTIVITY_LAST_PAGE_URLS: Record<ActivityType, string> = {
    libre: '/contenu-libre/3',
    jeu: '/creer-un-jeu/3',
    enigme: '/creer-une-enigme/3',
    indice: '/creer-un-indice/3',
    reportage: '/creer-un-reportage/3',
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
    question: null,
};
