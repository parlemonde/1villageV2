import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import Link from 'next/link';
import PelicoSouriant from '@frontend/svg/pelico/pelico-souriant.svg';

const StorySuccess = () => {
    return (
        <PageContainer>
            <div
                style={{
                    width: '100%',
                    maxWidth: '20rem',
                    margin: '4rem auto',
                    backgroundColor: '#f5f5f5',
                    padding: '1rem',
                    borderRadius: '10px',
                }}
            >
                <p className="text" style={{ margin: '1rem 1.5rem' }}>
                    Votre histoire a bien été publiée !
                </p>
                <PelicoSouriant style={{ width: '60%', height: 'auto', margin: '0 20%' }} />
            </div>
            <div className="text-center">
                <Link href="/" passHref>
                    <Button as="a" href="/" variant="outlined" color="primary" label="Retour à l'accueil" />
                </Link>
            </div>
        </PageContainer>
    );
};

export default StorySuccess;
