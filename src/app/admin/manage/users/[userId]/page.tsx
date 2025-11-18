import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { SectionContainer } from '@frontend/components/ui/SectionContainer/SectionContainer';
import { Title } from '@frontend/components/ui/Title';
import { db } from '@server/database';
import { users } from '@server/database/schemas/users';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

interface ServerPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    params: Promise<{ [key: string]: string }>;
}

export default async function AdminManageVillageEditPage({ params }: ServerPageProps) {
    const userId = (await params).userId;
    const isNew = userId === 'new';
    const user = isNew
        ? undefined
        : await db.query.users.findFirst({
              where: eq(users.id, userId),
          });
    if (!user && !isNew) {
        notFound();
    }

    return (
        <>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Gérer', href: '/admin/manage' },
                    { label: 'Utilisateurs', href: '/admin/manage/users' },
                    {
                        label: user ? user.name : 'Nouvel utilisateur',
                    },
                ]}
            />

            <PageContainer title={user ? user.name : 'Ajouter un utilisateur'}>
                <SectionContainer></SectionContainer>
            </PageContainer>
            {/* <UserForm user={user} isNew={isNew} /> */}
        </>
    );
}
