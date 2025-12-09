import EnigmeIcon from '@frontend/svg/activities/enigme.svg';
import GameIcon from '@frontend/svg/activities/game.svg';
import FreeContentIcon from '@frontend/svg/navigation/free-content.svg';
import type { ActivityType } from '@server/database/schemas/activity-types';

export const ACTIVITY_NAMES: Record<ActivityType, string> = {
    libre: 'Contenu libre',
    jeu: 'Jeu',
    enigme: 'Énigme',
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
    libre: 'Publier un contenu libre',
    jeu: 'Créer un jeu',
    enigme: 'Créer une énigme',
};

export const ACTIVITY_CARD_TITLES: Record<ActivityType, string> = {
    libre: 'envoyé un message à ses Pélicopains',
    jeu: 'lancé un jeu',
    enigme: 'créé une énigme',
};

export const ACTIVITY_ICONS: Record<ActivityType, React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>> | null> = {
    libre: FreeContentIcon,
    jeu: GameIcon,
    enigme: EnigmeIcon,
};

export const ACTIVITY_URLS: Record<ActivityType, string> = {
    libre: '/contenu-libre',
    jeu: '/creer-un-jeu',
    enigme: '/creer-une-enigme',
};
