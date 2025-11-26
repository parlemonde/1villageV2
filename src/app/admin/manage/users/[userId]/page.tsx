import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { SectionContainer } from '@frontend/components/ui/SectionContainer/SectionContainer';
import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { users } from '@server/database/schemas/users';
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

    // Fetch classroom data if user is a teacher
    const classroom =
        user.role === 'teacher'
            ? await db.query.classrooms.findFirst({
                  where: eq(classrooms.teacherId, userId),
              })
            : undefined;

    return (
        <>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Gérer', href: '/admin/manage' },
                    { label: 'Utilisateurs', href: '/admin/manage/users' },
                    {
                        label: 'Modifier un utilisateur',
                    },
                ]}
            />

            <PageContainer title={user.name}>
                <SectionContainer>
                    <UserForm user={user} classroom={classroom} isNew={false} />
                </SectionContainer>
            </PageContainer>
        </>
    );
}
