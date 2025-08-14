import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs';
import { Title } from '@/components/ui/Title';
import { db } from '@/database';
import { villages } from '@/database/schemas/villages';

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
    const villageId = getVillageId((await params).villageId);
    const village = villageId
        ? await db.query.villages.findFirst({
              where: eq(villages.id, villageId),
          })
        : undefined;

    if (!village) {
        redirect('/admin/manage/villages');
    }

    return (
        <>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Gérer', href: '/admin/manage' },
                    { label: 'Villages-mondes', href: '/admin/manage/villages' },
                    {
                        label: village.name,
                    },
                ]}
            />
            <Title marginY="md">
                <span>{village.name}</span>
            </Title>
            {villageId}
        </>
    );
}
