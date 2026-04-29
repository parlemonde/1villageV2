'use client';

import AnthemIcon from '@frontend/svg/activities/anthem.svg';
import ChallengeIcon from '@frontend/svg/activities/challenge.svg';
import EnigmeIcon from '@frontend/svg/activities/enigme.svg';
import FreeContentIcon from '@frontend/svg/activities/free-content.svg';
import GameIcon from '@frontend/svg/activities/game.svg';
import HintIcon from '@frontend/svg/activities/hint.svg';
import MascotIcon from '@frontend/svg/activities/mascot.svg';
import QuestionIcon from '@frontend/svg/activities/question.svg';
import ReportageIcon from '@frontend/svg/activities/reportage.svg';
import StoryIcon from '@frontend/svg/activities/story.svg';
import type { ActivityType, GameType } from '@server/database/schemas/activity-types';
import type { UserRole } from '@server/database/schemas/users';
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
                case 'histoire':
                    return t('Histoire');
                case 'mascotte':
                    return t('Mascotte');
                case 'defi':
                    return t('Défi');
                case 'question':
                    return t('Question');
                case 'presentation-pelico':
                    return t('Présentation Pélico');
                case 'hymne':
                    return t('Hymne');
                case 'reaction':
                    return t('Réaction');
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
                    return t('Publier un indice');
                case 'reportage':
                    return t('Publier un reportage');
                case 'histoire':
                    return t('Inventer une histoire');
                case 'mascotte':
                    return t('Créer sa mascotte');
                case 'defi':
                    return t('Lancer un defi');
                case 'question':
                    return t('Poser une question');
                case 'presentation-pelico':
                    return t('Présentation Pelico');
                case 'hymne':
                    return t('Créer un hymne');
                case 'reaction':
                    return t('Réagir à une activité');
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

export const useActivityCardTitle = () => {
    const t = useExtracted('activities-constants');
    const getActivityCardTitle = React.useCallback(
        (type: ActivityType): string => {
            switch (type) {
                case 'libre':
                    return t('publié un message');
                case 'jeu':
                    return t('lancé un jeu');
                case 'enigme':
                    return t('créé une énigme');
                case 'indice':
                    return t('publié un indice');
                case 'reportage':
                    return t('publié un reportage');
                case 'histoire':
                    return t('inventé une histoire');
                case 'mascotte':
                    return t('créé sa mascotte');
                case 'defi':
                    return t('lancé un défi');
                case 'question':
                    return t('posé une question');
                case 'presentation-pelico':
                    return t('se présente');
                case 'hymne':
                    return t('créé un hymne');
                case 'reaction':
                    return t('réagit à une activité');
            }
        },
        [t],
    );

    return getActivityCardTitle;
};

export const ACTIVITY_ICONS: Record<ActivityType, React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>> | null> = {
    libre: FreeContentIcon,
    jeu: GameIcon,
    enigme: EnigmeIcon,
    indice: HintIcon,
    mascotte: MascotIcon,
    reportage: ReportageIcon,
    histoire: StoryIcon,
    defi: ChallengeIcon,
    question: QuestionIcon,
    'presentation-pelico': null,
    hymne: AnthemIcon,
    reaction: null,
};

export const ACTIVITY_URLS: Record<ActivityType, string> = {
    libre: '/contenu-libre',
    jeu: '/creer-un-jeu',
    enigme: '/creer-une-enigme',
    indice: '/creer-un-indice',
    mascotte: '/creer-sa-mascotte',
    reportage: '/creer-un-reportage',
    histoire: '/creer-une-histoire',
    defi: '/lancer-un-defi',
    question: '/poser-une-question',
    'presentation-pelico': '/pelico',
    hymne: '/admin/create/hymne',
    reaction: '/reagir-a-une-activite',
};

type ActivityRoute = string | ((theme: GameType) => string);
export const ACTIVITY_LAST_PAGE_URLS: Record<ActivityType, ActivityRoute> = {
    libre: '/contenu-libre/3',
    jeu: (theme: GameType) => {
        switch (theme) {
            case 'expression':
                return '/creer-un-jeu/expression/5';
            case 'mimique':
                return '/creer-un-jeu/mimique/4';
            case 'monnaie':
                return '/creer-un-jeu/monnaie/5';
        }
    },
    enigme: '/creer-une-enigme/3',
    indice: '/creer-un-indice/3',
    mascotte: '/creer-sa-mascotte/5',
    reportage: '/creer-un-reportage/3',
    histoire: '/creer-une-histoire/3',
    defi: '/lancer-un-defi/3',
    question: '/poser-une-question/3',
    'presentation-pelico': '/pelico',
    hymne: '/admin/create/hymne/5',
    reaction: '/reagir-a-une-activite/3',
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
    histoire: null,
    question: null,
    'presentation-pelico': ['admin', 'mediator'],
    hymne: ['admin', 'mediator'],
    reaction: null,
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
