import { Button } from '@frontend/components/ui/Button';
import { Title } from '@frontend/components/ui/Title';
import PelicoSouriant from '@frontend/svg/pelico/pelico-souriant.svg';

export default function FreeContentSuccess() {
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
                <Title variant="h3">Votre publication a été publiée avec succès !</Title>
                <PelicoSouriant style={{ width: '160px', height: 'auto' }} />
            </div>
            <Button as="a" href="/" color="primary" label="Retour à l'accueil" />
        </div>
    );
}
