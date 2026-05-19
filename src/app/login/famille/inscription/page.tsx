import { Title } from '@frontend/components/ui/Title';
import { getEnvVariable } from '@server/lib/get-env-variable';
import { getExtracted } from 'next-intl/server';

import { RegisterForm } from './RegisterForm';

export default async function RegisterPage() {
    const t = await getExtracted('app.login.famille.inscription');
    const appUrl = getEnvVariable('HOST_URL');
    return (
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <Title variant="h2" color="inherit" marginY="md">
                {t('Créer un compte')}
            </Title>
            <RegisterForm appUrl={appUrl} />
        </div>
    );
}
