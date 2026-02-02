'use client';

import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

export default function CreerUnJeuMonnaiePage() {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu.monnaie');

    const router = useRouter();

    const { onCreateActivity } = useContext(ActivityContext);
    const { user } = useContext(UserContext);

    const isPelico = user.role === 'admin' || user.role === 'mediator';

    const goToNextStep = () => {
        onCreateActivity('jeu', isPelico, {
            theme: 'monnaie',
        });

        router.push('/creer-un-jeu/monnaie/1');
    };

    return (
        <PageContainer>
            <p style={{ marginTop: '16px' }}>
                {t(
                    "Savez-vous qu'il existe beaucoup de monnaies différentes à travers le monde ? Selon le pays, les billets et les pièces n'ont pas les mêmes dessins, couleurs et ne représentent pas la même somme d'argent !",
                )}
            </p>
            <div style={{ textAlign: 'right', marginTop: '32px' }}>
                <Button color="primary" label={t('Faire découvrir 3 objets')} onClick={goToNextStep} />
            </div>
        </PageContainer>
    );
}
