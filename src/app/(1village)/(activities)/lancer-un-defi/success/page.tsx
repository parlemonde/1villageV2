import { Button } from '@frontend/components/ui/Button';
import { Title } from '@frontend/components/ui/Title';
import PelicoSouriant from '@frontend/svg/pelico/pelico-souriant.svg';
import { getExtracted } from 'next-intl/server';

export default async function LancerUnnDefiSuccess() {
    const t = await getExtracted('app.(1village).(activities).lancer-un-defi.success');
    const tCommon = await getExtracted('common');

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
                <Title variant="h3">{t('Votre défi a été publié avec succès !')}</Title>
                <PelicoSouriant style={{ width: '160px', height: 'auto' }} />
            </div>
            <Button as="a" href="/" color="primary" label={tCommon("Retour à l'accueil")} />
        </div>
    );
}
