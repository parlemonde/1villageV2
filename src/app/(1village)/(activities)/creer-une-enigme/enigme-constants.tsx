import EvenementIcon from '@frontend/svg/enigmes/evenement-mystere.svg';
import LocalisationIcon from '@frontend/svg/enigmes/localisation-mystere.svg';
import ObjetIcon from '@frontend/svg/enigmes/objet-mystere.svg';
import PersonaliteIcon from '@frontend/svg/enigmes/personalite-mystere.svg';
import { useExtracted } from 'next-intl';
import React, { useMemo, useCallback } from 'react';

export const CUSTOM_THEME_VALUE = 'Autre thème';

export type ThemeName = 'Objet mystère' | 'Évènement mystère' | 'Personnalité mystère' | 'Lieu mystère' | 'Autre thème';

export type ThemeItem = {
    name: ThemeName;
    label: string;
    icon: React.ReactNode;
};

export type SubThemeItem = {
    name: string;
    label: string;
};

export const useEnigmeThemes = () => {
    const t = useExtracted('app.(1village).(activities).creer-une-enigme');

    const DEFAULT_THEMES: ThemeItem[] = useMemo(
        () => [
            { name: 'Objet mystère', label: t('Objet mystère'), icon: <ObjetIcon /> },
            { name: 'Évènement mystère', label: t('Évènement mystère'), icon: <EvenementIcon /> },
            { name: 'Personnalité mystère', label: t('Personnalité mystère'), icon: <PersonaliteIcon /> },
            { name: 'Lieu mystère', label: t('Lieu mystère'), icon: <LocalisationIcon /> },
            { name: 'Autre thème', label: t('Autre thème'), icon: <></> },
        ],
        [t],
    );

    const getThemeLabel = useCallback((name: ThemeName) => DEFAULT_THEMES.find((theme) => theme.name === name)?.label || name, [DEFAULT_THEMES]);

    return { DEFAULT_THEMES, getThemeLabel };
};

export const useEnigmeSubthemes = (): Record<ThemeName, SubThemeItem[]> => {
    const t = useExtracted('app.(1village).(activities).creer-une-enigme');

    return useMemo(
        () => ({
            'Objet mystère': [
                { name: 'Un jouet', label: t('Un jouet') },
                { name: 'Un ustensile', label: t('Un ustensile') },
                { name: 'Un objet de culte', label: t('Un objet de culte') },
                { name: 'Un instrument de musique', label: t('Un instrument de musique') },
                { name: 'Un costume', label: t('Un costume') },
            ],
            'Évènement mystère': [
                { name: 'Une fête de l’école', label: t('Une fête de l’école') },
                { name: 'Un festival', label: t('Un festival') },
                { name: 'Un fait historique', label: t('Un fait historique') },
                { name: 'Une fête nationale', label: t('Une fête nationale') },
            ],
            'Personnalité mystère': [
                { name: 'Un personnage historique', label: t('Un personnage historique') },
                { name: 'Un personnage de fiction', label: t('Un personnage de fiction') },
                { name: 'Un personnage contemporain', label: t('Un personnage contemporain') },
            ],
            'Lieu mystère': [
                { name: 'Un monument commémoratif', label: t('Un monument commémoratif') },
                { name: ' Un édifice remarquable', label: t(' Un édifice remarquable') },
                { name: ' Une salle de spectacle', label: t(' Une salle de spectacle') },
                { name: " Un ouvrage d'art", label: t(" Un ouvrage d'art") },
            ],
            'Autre thème': [],
        }),
        [t],
    );
};

export const useGetStepThemeName = function (defaultTheme: ThemeName, customTheme?: string): string {
    const { DEFAULT_THEMES } = useEnigmeThemes();
    const DEFAULT_SUBTHEMES = useEnigmeSubthemes();
    return useMemo(() => {
        return customTheme
            ? DEFAULT_SUBTHEMES[defaultTheme]?.find((subtheme) => subtheme.name === customTheme)?.label || customTheme
            : DEFAULT_THEMES.find((theme) => theme.name === defaultTheme)?.label || defaultTheme;
    }, [defaultTheme, customTheme, DEFAULT_THEMES, DEFAULT_SUBTHEMES]);
};
