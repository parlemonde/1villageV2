import type { ActivityType } from '@server/database/schemas/activity-types';
import { getExtracted } from 'next-intl/server';

export async function getActivityName(type: ActivityType): Promise<string> {
    const t = await getExtracted('activities-constants');

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
        default:
            return '';
    }
}
