import { Button } from '@frontend/components/ui/Button';
import { Title } from '@frontend/components/ui/Title';
import PelicoSearching from '@frontend/svg/pelico/pelico-search.svg';

export default function Activity404() {
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
                <Title variant="h3">Activité non trouvée !</Title>
                <PelicoSearching style={{ width: '160px', height: 'auto' }} />
            </div>
            <Button as="a" href="/" color="primary" label="Retour à l'accueil" />
        </div>
    );
}
