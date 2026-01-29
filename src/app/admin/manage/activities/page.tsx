import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { db } from '@server/database';
import { phaseActivityTypes } from '@server/database/schemas/activity-types';

import { ActivityPhasesTable } from './ActivityPhasesTable';

export default async function AdminManageActivitiesPage() {
    const phases = await db.select().from(phaseActivityTypes);

    return (
        <PageContainer>
            <Breadcrumbs breadcrumbs={[{ label: 'Gérer', href: '/admin/manage' }, { label: 'Activités' }]} />
            <Title marginY="md">Paramétrer les activités</Title>
            <ActivityPhasesTable phases={phases} />
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
