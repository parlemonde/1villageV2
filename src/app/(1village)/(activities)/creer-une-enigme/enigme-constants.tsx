import EvenementIcon from '@frontend/svg/enigmes/evenement-mystere.svg';
import LocalisationIcon from '@frontend/svg/enigmes/localisation-mystere.svg';
import ObjetIcon from '@frontend/svg/enigmes/objet-mystere.svg';
import PersonaliteIcon from '@frontend/svg/enigmes/personalite-mystere.svg';
import { useExtracted } from 'next-intl';
import React, { useMemo } from 'react';

export const CUSTOM_THEME_VALUE = 'Autre thème';

export type ThemeName = 'Objet mystère' | 'Évènement mystère' | 'Personnalité mystère' | 'Lieu mystère' | 'Autre thème';

export type ThemeItem = {
    name: ThemeName;
    tname: string;
    icon: React.ReactNode;
};

export type SubThemeItem = {
    name: string;
    tname: string;
};

export const useEnigmeThemes = (): ThemeItem[] => {
    const t = useExtracted('app.(1village).(activities).creer-une-enigme');

    return useMemo(
        () => [
            { name: 'Objet mystère', tname: t('Objet mystère'), icon: <ObjetIcon /> },
            { name: 'Évènement mystère', tname: t('Évènement mystère'), icon: <EvenementIcon /> },
            { name: 'Personnalité mystère', tname: t('Personnalité mystère'), icon: <PersonaliteIcon /> },
            { name: 'Lieu mystère', tname: t('Lieu mystère'), icon: <LocalisationIcon /> },
            { name: 'Autre thème', tname: t('Créer une énigme sur un autre thème'), icon: <></> },
        ],
        [t],
    );
};

export const useEnigmeSubthemes = (): Record<ThemeName, SubThemeItem[]> => {
    const t = useExtracted('app.(1village).(activities).creer-une-enigme');

    return useMemo(
        () => ({
            'Objet mystère': [
                { name: 'Un jouet', tname: t('Un jouet') },
                { name: 'Un ustensile', tname: t('Un ustensile') },
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
            'Autre thème': [],
        }),
        [t],
    );
};
