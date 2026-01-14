import EvenementIcon from '@frontend/svg/enigmes/evenement-mystere.svg';
import LocalisationIcon from '@frontend/svg/enigmes/localisation-mystere.svg';
import ObjetIcon from '@frontend/svg/enigmes/objet-mystere.svg';
import PersonaliteIcon from '@frontend/svg/enigmes/personalite-mystere.svg';
import { useExtracted } from 'next-intl';
// import React from 'react';

export const useTranslatableThemes = () => {
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

export const useTranslatableSubthemes = () => {
    const t = useExtracted('app.(1village).(activities).creer-une-enigme');

    return {
        DEFAULT_SUBTHEMES: {
            [t('Objet mystère')]: [t('Un jouet'), t('Un ustentil'), t('Un objet de culte'), t('Un instrument de musique'), t('Un costume')],
            [t('Évènement mystère')]: [t('Une fête de l’école'), t('Un festival'), t('Un fait historique'), t('Une fête nationale')],
            [t('Personnalité mystère')]: [t('Un personnage historique'), t('Un personnage de fiction'), t('Un personnage contemporain')],
            [t('Lieu mystère')]: [t('Un monument commémoratif'), t('Un édifice remarquable'), t('Une salle de spectacle'), t("Un ouvrage d'art")],
        },
    };
};

// export const DEFAULT_THEMES: {
//     name: string;
//     icon: React.ReactNode;
// }[] = [
//     { name: 'Objet mystère', icon: <ObjetIcon /> },
//     { name: 'Évènement mystère', icon: <EvenementIcon /> },
//     { name: 'Personnalité mystère', icon: <PersonaliteIcon /> },
//     { name: 'Lieu mystère', icon: <LocalisationIcon /> },
// ];

// export const DEFAULT_SUBTHEMES: Record<string, string[]> = {
//     'Objet mystère': ['Un jouet', 'Un ustentil', 'Un objet de culte', 'Un instrument de musique', 'Un costume'],
//     'Évènement mystère': ['Une fête de l’école', 'Un festival', 'Un fait historique', 'Une fête nationale'],
//     'Personnalité mystère': ['Un personnage historique', 'Un personnage de fiction', 'Un personnage contemporain'],
//     'Lieu mystère': ['Un monument commémoratif', 'Un édifice remarquable', 'Une salle de spectacle', "Un ouvrage d'art"],
// };
