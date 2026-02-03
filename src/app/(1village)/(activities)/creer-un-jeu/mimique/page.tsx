'use client';

import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

export default function CreerUnJeuMimiquePage() {
    const t = useExtracted('app.activities.creer-un-jeu.mimique');

    const router = useRouter();

    const { onCreateActivity } = useContext(ActivityContext);
    const { user } = useContext(UserContext);

    const isPelico = user.role === 'admin' || user.role === 'mediator';

    const goToNextStep = () => {
        onCreateActivity('jeu', isPelico, {
            theme: 'mimique',
        });

        router.push('/creer-un-jeu/mimique/1');
    };

    return (
        <PageContainer title={t("Qu'est-ce qu'une mimique ?")}>
            <p>
                {t(
                    "Une mimique est un geste du corps qui exprime une émotion, une pensée et que l'on fait dans certaines situations. Par exemple, un signe des mains pour dire bonjour ! Ou bien, un mouvement du visage pour exprimer la colère.",
                )}
            </p>
            <div style={{ textAlign: 'right', marginTop: '32px' }}>
                <Button onClick={goToNextStep} color="primary" label={t('Faire découvrir 3 mimiques')} />
            </div>
        </PageContainer>
    );
}
