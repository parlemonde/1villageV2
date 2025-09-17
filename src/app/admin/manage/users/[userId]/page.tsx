import { Breadcrumbs } from '@frontend/components/navigation/Breadcrumbs/Breadcrumbs';
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
            <Title marginY="md">{user ? user.name : 'Ajouter un utilisateur'}</Title>
            {/* <UserForm user={user} isNew={isNew} /> */}
        </>
    );
}
