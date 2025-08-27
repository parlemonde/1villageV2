import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs';
import { Title } from '@/components/ui/Title';
import { db } from '@/database';
import { users } from '@/database/schemas/users';

interface ServerPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    params: Promise<{ [key: string]: string }>;
}

const getUserId = (param: string) => {
    const userId = Number(param);
    if (isNaN(userId) || !isFinite(userId) || !Number.isInteger(userId)) {
        return null;
    }
    return userId;
};

export default async function AdminManageVillageEditPage({ params }: ServerPageProps) {
    const userIdParam = (await params).userId;
    const isNew = userIdParam === 'new';
    const userId = isNew ? null : getUserId(userIdParam);
    const user = userId
        ? await db.query.users.findFirst({
              where: eq(users.id, userId),
          })
        : undefined;

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
