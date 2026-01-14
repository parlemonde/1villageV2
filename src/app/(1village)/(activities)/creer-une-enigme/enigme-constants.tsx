import EvenementIcon from '@frontend/svg/enigmes/evenement-mystere.svg';
import LocalisationIcon from '@frontend/svg/enigmes/localisation-mystere.svg';
import ObjetIcon from '@frontend/svg/enigmes/objet-mystere.svg';
import PersonaliteIcon from '@frontend/svg/enigmes/personalite-mystere.svg';
import React from 'react';

export const DEFAULT_THEMES: {
    name: string;
    icon: React.ReactNode;
}[] = [
    { name: 'Objet mystère', icon: <ObjetIcon /> },
    { name: 'Évènement mystère', icon: <EvenementIcon /> },
    { name: 'Personnalité mystère', icon: <PersonaliteIcon /> },
    { name: 'Lieu mystère', icon: <LocalisationIcon /> },
];
