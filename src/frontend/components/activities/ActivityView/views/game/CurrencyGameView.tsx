import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import { CURRENCIES } from '@frontend/lib/iso-4217-currencies-french';
import type { CurrencyGame } from '@server/database/schemas/activity-types';
import { useExtracted } from 'next-intl';
import { useMemo } from 'react';

import type { Round } from './GameEngine';
import { GameEngine } from './GameEngine';

export const CurrencyGameView = ({ activity }: ActivityContentViewProps) => {
    const t = useExtracted('CurrencyGameView');

    const createRounds = useMemo((): Round[] | undefined => {
        if (activity.type !== 'jeu' || activity.data?.theme !== 'monnaie') {
            return;
        }

        const data = activity.data as CurrencyGame;

        const allRounds = [];

        for (const obj of data.objects ?? []) {
            const roundOptions = [{ label: `${obj.price} ${CURRENCIES[data.currency ?? '']}`, value: 'true' }];
            obj.falsePrices?.forEach((falsePrice, index) => {
                roundOptions.push({ label: `${falsePrice} ${CURRENCIES[data.currency ?? '']}`, value: index.toString() }); // value must be unique
            });

            allRounds.push({
                title: obj.name ?? '',
                imageUrl: obj.imageUrl ?? '',
                options: roundOptions,
            });
        }

        return allRounds;
    }, [activity.data, activity.type]);

    if (activity.type !== 'jeu' || activity.data?.theme !== 'monnaie') {
        return null;
    }

    if (createRounds) {
        return (
            <GameEngine
                rounds={createRounds}
                question={t('Combien vaut cet objet ?')}
                successMessage={t("C'est exact ! Vous avez trouvé combien vaut cet objet.")}
                errorMessage={t("Dommage ! Ce n'est pas la bonne réponse. Essayez encore !")}
            />
        );
    }
};
