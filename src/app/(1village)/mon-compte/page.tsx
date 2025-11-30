import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { isSSOUser as isSSOUserHelper } from '@server/helpers/is-sso-user';

import { MyAccount } from './MyAccount';

export default async function MyAccountPage() {
    const user = await getCurrentUser();

    if (!user) {
        // Login redirection is handled by the parent layout
        return null;
    }

    const isSSOUser = await isSSOUserHelper(user.id);

    return (
        <PageContainer title="Paramètres du compte">
            <Title marginY="md" variant="h2">
                Identifiants de connexion
            </Title>
            <MyAccount isSSOUser={isSSOUser} />
        </PageContainer>
    );
}
