import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { getPelicoPresentation } from '@server/entities/activities/get-pelico-presentation';
import { getExtracted } from 'next-intl/server';

import { PelicoPresentationPage } from './PelicoPresentationPage';

export default async function AdminPelicoPresentation() {
    const t = await getExtracted('app.admin.manage.pelico');

    const presentation = await getPelicoPresentation();

    return (
        <PageContainer>
            <Breadcrumbs breadcrumbs={[{ label: t('Gérer'), href: '/admin/manage' }, { label: t('Présentation de Pélico') }]} />
            <Title marginY="md">{t('Présentation de Pélico')}</Title>
            <PelicoPresentationPage presentation={presentation} />
        </PageContainer>
    );
}
