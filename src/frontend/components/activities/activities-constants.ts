import EnigmeIcon from '@frontend/svg/activities/enigme.svg';
import FreeContentIcon from '@frontend/svg/activities/free-content.svg';
import GameIcon from '@frontend/svg/activities/game.svg';
import HintIcon from '@frontend/svg/activities/hint.svg';
import type { ActivityType } from '@server/database/schemas/activity-types';

export const ACTIVITY_NAMES: Record<ActivityType, string> = {
    libre: 'Contenu libre',
    jeu: 'Jeu',
    enigme: 'Énigme',
    indice: 'Indice',
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
    libre: 'Publier un contenu libre',
    jeu: 'Créer un jeu',
    enigme: 'Créer une énigme',
    indice: 'Créer un indice',
};

export const ACTIVITY_CARD_TITLES: Record<ActivityType, string> = {
    libre: 'envoyé un message à ses Pélicopains',
    jeu: 'lancé un jeu',
    enigme: 'créé une énigme',
    indice: 'créé un indice',
};

export const ACTIVITY_ICONS: Record<ActivityType, React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>> | null> = {
    libre: FreeContentIcon,
    jeu: GameIcon,
    enigme: EnigmeIcon,
    indice: HintIcon,
};

export const ACTIVITY_URLS: Record<ActivityType, string> = {
    libre: '/contenu-libre',
    jeu: '/creer-un-jeu',
    enigme: '/creer-une-enigme',
    indice: '/creer-un-indice',
};

export const ACTIVITY_LAST_PAGE_URLS: Record<ActivityType, string> = {
    libre: '/contenu-libre/3',
    jeu: '/creer-un-jeu/3',
    enigme: '/creer-une-enigme/3',
    indice: '/creer-un-indice/3',
};
