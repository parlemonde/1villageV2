'use client';

import { Button } from '@frontend/components/ui/Button';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import PelicoSouriant from '@frontend/svg/pelico/pelico-souriant.svg';
import Link from 'next/link';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

export default function CreerUnJeuExpressionSuccess() {
    const t = useExtracted('app.(1village).(activities).creer-un-jeu.expression.success');
    const tCommon = useExtracted('common');

    const { activity } = useContext(ActivityContext);

    const message = activity?.publishDate
        ? t('Votre jeu des expressions a été modifié avec succès !')
        : t('Votre jeu des expressions a été publié avec succès !');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px', gap: '48px' }}>
            <div
                style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    backgroundColor: 'var(--grey-100)',
                    padding: '16px',
                    borderRadius: '8px',
                }}
            >
                <Title variant="h3">{message}</Title>
                <PelicoSouriant style={{ width: '160px', height: 'auto' }} />
            </div>
            <Button as="a" href="/" color="primary" label={tCommon("Retour à l'accueil")} marginBottom="lg" />
            <Link href="/creer-un-jeu/expression/explorer" color="primary">
                {tCommon('Ou découvrez les jeux des autres pélicopains !')}
            </Link>
        </div>
    );
}
