import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import type { UserRole } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getPelicoPresentation } from '@server-actions/activities/get-pelico-presentation';
import { getExtracted } from 'next-intl/server';

import { PelicoPresentationPage } from './PelicoPresentationPage';

export default async function AdminPelicoPresentation() {
    const t = await getExtracted('app.admin.manage.pelico');
    const user = await getCurrentUser();
    const hasAccess = user != null && (['admin', 'mediator'] as UserRole[]).includes(user.role);

    if (!hasAccess) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <h1>{t("Vous n'avez pas accès à cette page, vous devez être médiateur, modérateur ou super admin.")}</h1>
            </div>
        );
    }

    const presentation = await getPelicoPresentation();

    return (
        <PageContainer>
            <Breadcrumbs breadcrumbs={[{ label: t('Gérer'), href: '/admin/manage' }, { label: t('Présentation de Pélico') }]} />
            <Title marginY="md">{t('Présentation de Pélico')}</Title>
            <PelicoPresentationPage presentation={presentation} />
        </PageContainer>
    );
}
