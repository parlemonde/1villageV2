import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { db } from '@server/database';
import { users } from '@server/database/schemas/users';
import { isSSOUser as isSSOUserHelper } from '@server/helpers/is-sso-user';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { UserForm } from '../new/UserForm';

interface ServerPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    params: Promise<{ [key: string]: string }>;
}

export default async function AdminEditUserPage({ params }: ServerPageProps) {
    const { userId } = await params;

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user) {
        notFound();
    }

    const isSSOUser = await isSSOUserHelper(userId);

    return (
        <PageContainer>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Gérer', href: '/admin/manage' },
                    { label: 'Utilisateurs', href: '/admin/manage/users' },
                    {
                        label: user.name,
                    },
                ]}
            />
            <Title marginY="md">{user.name}</Title>
            <UserForm user={user} isSSOUser={isSSOUser} isNew={false} />
        </PageContainer>
    );
}
