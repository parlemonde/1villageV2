import { Button } from '@frontend/components/ui/Button';
import { Title } from '@frontend/components/ui/Title';
import FamilyIcon from '@frontend/svg/login/family.svg';
import EducationIcon from '@frontend/svg/login/school.svg';
import { isParlemondeSSOPluginEnabled, PARLEMONDE_SSO_PROVIDER_ID } from '@server/lib/parlemonde-sso-plugin';
import { redirect } from 'next/navigation';

import { SsoLoginButton } from './SsoLoginButton';
import styles from './page.module.css';

interface ServerPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    params: Promise<{ [key: string]: string }>;
}

export default async function LoginPage({ searchParams }: ServerPageProps) {
    const searchParamsData = await searchParams;
    const ssoProvider = PARLEMONDE_SSO_PROVIDER_ID;
    const isSsoEnabled = isParlemondeSSOPluginEnabled;

    // Handle SSO callback.
    if (searchParamsData.code && searchParamsData.state) {
        redirect(`${process.env.HOST_URL || ''}/api/auth/callback/${ssoProvider}?code=${searchParamsData.code}&state=${searchParamsData.state}`);
    }

    return (
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <Title variant="h2" color="inherit">
                Vous êtes :
            </Title>
            <div className={styles.loginVariants}>
                <div className={styles.variant}>
                    <Title variant="h3" color="inherit">
                        Professionnel de l&apos;éducation
                    </Title>
                    <EducationIcon className={styles.Icon} />
                    <SsoLoginButton provider={ssoProvider} isEnabled={isSsoEnabled} />
                </div>
                <div className={styles.separator} />
                <div className={styles.variant}>
                    <Title variant="h3" color="inherit">
                        Famille
                    </Title>
                    <FamilyIcon className={styles.Icon} />
                    <Button
                        color="primary"
                        as="a"
                        label="1Village en famille"
                        isUpperCase={false}
                        href="/login/famille"
                        className={styles.familyButton}
                    />
                </div>
            </div>
        </div>
    );
}
