import { Title } from '@frontend/components/ui/Title';
import { getExtracted } from 'next-intl/server';

export default async function VerifyEmailPage() {
    const t = await getExtracted('app.login.famille.verify-email');

    return (
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <Title variant="h2" color="inherit" marginY="md">
                {t('Créer un compte')}
            </Title>
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <strong>{t('Bienvenue dans 1Village !')}</strong>
                <p>{t("Un email de confirmation vous a été envoyé à l'adresse indiquée.")}</p>
            </div>
        </div>
    );
}
