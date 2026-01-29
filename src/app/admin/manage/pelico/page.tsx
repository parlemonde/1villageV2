import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import type { UserRole } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getPelicoPresentation } from '@server-actions/activities/get-pelico-presentation';

import { PelicoPresentationPage } from './PelicoPresentationPage';

export default async function AdminPelicoPresentation() {
    const user = await getCurrentUser();
    const hasAccess = user !== null && (['admin', 'mediator'] as UserRole[]).includes(user.role);

    if (!hasAccess) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <h1>Vous n&apos;avez pas accès à cette page, vous devez être médiateur, modérateur ou super admin.</h1>
            </div>
        );
    }

    const presentation = await getPelicoPresentation();

    return (
        <PageContainer>
            <Breadcrumbs breadcrumbs={[{ label: 'Gérer', href: '/admin/manage' }, { label: 'Présentation de Pélico' }]} />
            <Title marginY="md">Présentation de Pélico</Title>
            <PelicoPresentationPage presentation={presentation} />
            <Button
                as="a"
                color="primary"
                variant="outlined"
                label="Retour"
                href="/admin/manage"
                marginTop="lg"
                leftIcon={<ChevronLeftIcon width={18} height={18} />}
            />
        </PageContainer>
    );
}
