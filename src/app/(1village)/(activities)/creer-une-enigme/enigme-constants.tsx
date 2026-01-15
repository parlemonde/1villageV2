import EvenementIcon from '@frontend/svg/enigmes/evenement-mystere.svg';
import LocalisationIcon from '@frontend/svg/enigmes/localisation-mystere.svg';
import ObjetIcon from '@frontend/svg/enigmes/objet-mystere.svg';
import PersonaliteIcon from '@frontend/svg/enigmes/personalite-mystere.svg';
import { useExtracted } from 'next-intl';
import React from 'react';

type ThemeName = string;

type ThemeItem = {
    name: ThemeName;
    icon: React.ReactNode;
};

type UseTranslatableThemesReturn = {
    DEFAULT_THEMES: ThemeItem[];
};

type UseTranslatableSubthemesReturn = { [key: ThemeName]: ThemeName[] };

export const useTranslatableThemes = (): UseTranslatableThemesReturn => {
    const t = useExtracted('app.(1village).(activities).creer-une-enigme');

    return {
        DEFAULT_THEMES: [
            { name: t('Objet mystère'), icon: <ObjetIcon /> },
            { name: t('Évènement mystère'), icon: <EvenementIcon /> },
            { name: t('Personnalité mystère'), icon: <PersonaliteIcon /> },
            { name: t('Lieu mystère'), icon: <LocalisationIcon /> },
        ],
    };
};

export const useTranslatableSubthemes = (subtheme: ThemeName): UseTranslatableSubthemesReturn => {
    const t = useExtracted('app.(1village).(activities).creer-une-enigme');

    const DEFAULT_SUBTHEMES: Record<ThemeName, ThemeName[]> = {
        t('Objet mystère'): [t('Un jouet'), t('Un ustentil'), t('Un objet de culte'), t('Un instrument de musique'), t('Un costume')],
        t('Évènement mystère'): [t('Une fête de l’école'), t('Un festival'), t('Un fait historique'), t('Une fête nationale')],
        t('Personnalité mystère'): [t('Un personnage historique'), t('Un personnage de fiction'), t('Un personnage contemporain')],
        t('Lieu mystère'): [t('Un monument commémoratif'), t('Un édifice remarquable'), t('Une salle de spectacle'), t("Un ouvrage d'art")],
    };

    return { subtheme: DEFAULT_SUBTHEMES[subtheme] };
};
