import EvenementIcon from '@frontend/svg/enigmes/evenement-mystere.svg';
import LocalisationIcon from '@frontend/svg/enigmes/localisation-mystere.svg';
import ObjetIcon from '@frontend/svg/enigmes/objet-mystere.svg';
import PersonaliteIcon from '@frontend/svg/enigmes/personalite-mystere.svg';
import { useExtracted } from 'next-intl';
import React from 'react';

type ThemeName = 'Objet mystère' | 'Évènement mystère' | 'Personnalité mystère' | 'Lieu mystère';

export type ThemeItem = {
    name: ThemeName;
    tname: string;
    icon: React.ReactNode;
};

export type SubThemeItem = {
    name: string;
    tname: string;
};

type UseTranslatableThemesReturn = {
    DEFAULT_THEMES: ThemeItem[];
};

type UseTranslatableSubthemesReturn = Record<ThemeName, SubThemeItem[]>;

export const useTranslatableThemes = (): UseTranslatableThemesReturn => {
    const t = useExtracted('app.(1village).(activities).creer-une-enigme');

    return {
        DEFAULT_THEMES: [
            { name: 'Objet mystère', tname: t('Objet mystère'), icon: <ObjetIcon /> },
            { name: 'Évènement mystère', tname: t('Évènement mystère'), icon: <EvenementIcon /> },
            { name: 'Personnalité mystère', tname: t('Personnalité mystère'), icon: <PersonaliteIcon /> },
            { name: 'Lieu mystère', tname: t('Lieu mystère'), icon: <LocalisationIcon /> },
        ],
    };
};

export const useTranslatableSubthemes = (): UseTranslatableSubthemesReturn => {
    const t = useExtracted('app.(1village).(activities).creer-une-enigme');

    const DEFAULT_SUBTHEMES: Record<ThemeName, SubThemeItem[]> = {
        'Objet mystère': [
            { name: 'Un jouet', tname: t('Un jouet') },
            { name: 'Un ustentil', tname: t('Un ustentil') },
            { name: 'Un objet de culte', tname: t('Un objet de culte') },
            { name: 'Un instrument de musique', tname: t('Un instrument de musique') },
            { name: 'Un costume', tname: t('Un costume') },
        ],
        'Évènement mystère': [
            { name: 'Une fête de l’école', tname: t('Une fête de l’école') },
            { name: 'Un festival', tname: t('Un festival') },
            { name: 'Un fait historique', tname: t('Un fait historique') },
            { name: 'Une fête nationale', tname: t('Une fête nationale') },
        ],
        'Personnalité mystère': [
            { name: 'Un personnage historique', tname: t('Un personnage historique') },
            { name: 'Un personnage de fiction', tname: t('Un personnage de fiction') },
            { name: 'Un personnage contemporain', tname: t('Un personnage contemporain') },
        ],
        'Lieu mystère': [
            { name: 'Un monument commémoratif', tname: t('Un monument commémoratif') },
            { name: ' Un édifice remarquable', tname: t(' Un édifice remarquable') },
            { name: ' Une salle de spectacle', tname: t(' Une salle de spectacle') },
            { name: " Un ouvrage d'art", tname: t(" Un ouvrage d'art") },
        ],
    };

    return DEFAULT_SUBTHEMES;
};
