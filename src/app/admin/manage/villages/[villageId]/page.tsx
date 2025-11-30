import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { db } from '@server/database';
import { villages } from '@server/database/schemas/villages';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { VillageForm } from './VillageForm';

interface ServerPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    params: Promise<{ [key: string]: string }>;
}

const getVillageId = (param: string) => {
    const villageId = Number(param);
    if (isNaN(villageId) || !isFinite(villageId) || !Number.isInteger(villageId)) {
        return null;
    }
    return villageId;
};

export default async function AdminManageVillageEditPage({ params }: ServerPageProps) {
    const villageIdParam = (await params).villageId;
    const isNew = villageIdParam === 'new';
    const villageId = isNew ? null : getVillageId(villageIdParam);
    const village = villageId
        ? await db.query.villages.findFirst({
              where: eq(villages.id, villageId),
          })
        : undefined;

    if (!village && !isNew) {
        notFound();
    }

    return (
        <PageContainer>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Gérer', href: '/admin/manage' },
                    { label: 'Villages-mondes', href: '/admin/manage/villages' },
                    {
                        label: village ? village.name : 'Nouveau village-monde',
                    },
                ]}
            />
            <Title marginY="md">{village ? village.name : 'Ajouter un village-monde'}</Title>
            <VillageForm village={village} isNew={isNew} />
        </PageContainer>
    );
}
