import { Link } from '@frontend/components/ui/Link';
import { Title } from '@frontend/components/ui/Title';

import { LoginForm } from './LoginForm';

export default function FamilyLoginPage() {
    return (
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <Title variant="h2" color="inherit" marginY="md">
                Famille
            </Title>
            <LoginForm />
            <Link href="/login/famille/forgot-password" style={{ color: 'var(--primary-color)', textDecoration: 'underline', fontSize: '14px' }}>
                Mot de passe oublié ?
            </Link>
            <span style={{ fontSize: '14px', marginTop: '16px' }}>
                Nouveau sur 1Village?{' '}
                <Link href="/login/famille/register" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
                    Créer un compte
                </Link>
            </span>
        </div>
    );
}
