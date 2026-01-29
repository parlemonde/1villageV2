'use client';

import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

export default function CreerUnJeuExpressionPage() {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu.expression');

    const router = useRouter();

    const { onCreateActivity } = useContext(ActivityContext);
    const { user } = useContext(UserContext);

    const isPelico = user.role === 'admin' || user.role === 'mediator';

    const goToNextStep = () => {
        onCreateActivity('jeu', isPelico, {
            theme: 'expression',
        });
        router.push('/creer-un-jeu/expression/1');
    };

    return (
        <PageContainer title={t("Qu'est ce qu'une expression ?")}>
            <p>
                {t(
                    "Une expression est une formule toute faite qu'on utilise le plus souvent à l'oral pour commenter une situation ou exprimer un jugement. Par exemple, pour dire qu'il pleut beaucoup, on peut dire en français \"il pleut comme une vache qui pisse\" alors qu'en anglais on dit \"it's raining cats and dogs\" (il pleut des chats et des chiens).",
                )}
            </p>
            <div style={{ textAlign: 'right', marginTop: '32px' }}>
                <Button color="primary" label={t('Créer 3 expressions')} onClick={goToNextStep} />
            </div>
        </PageContainer>
    );
}
