import { LoginForm } from './LoginForm';
import { Flex } from '@/components/ui/Flex';
import { Title } from '@/components/ui/Title';
import { Link } from '@/components/navigation/Link';

export default function FamilyLoginPage() {
    return (
        <Flex isFullWidth flexDirection="column" alignItems="center" justifyContent="center" padding="md">
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
        </Flex>
    );
}
