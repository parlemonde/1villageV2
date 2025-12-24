import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { ClassroomForm } from '../new/ClassroomForm';

interface ServerPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    params: Promise<{ [key: string]: string }>;
}

export default async function AdminEditClassroomPage({ params }: ServerPageProps) {
    const classroomIdParam = (await params).classroomId;
    const classroomId = Number(classroomIdParam);

    const classroom = await db.query.classrooms.findFirst({
        where: eq(classrooms.id, classroomId),
    });

    if (!classroom) {
        notFound();
    }

    return (
        <PageContainer>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Gérer', href: '/admin/manage' },
                    { label: 'Classes', href: '/admin/manage/classrooms' },
                    {
                        label: classroom.alias ?? `Les ${classroom.level} de ${classroom.name}`,
                    },
                ]}
            />
            <Title marginY="md">{classroom.alias ?? `Les ${classroom.level} de ${classroom.name}`}</Title>
            <ClassroomForm classroom={classroom} />
        </PageContainer>
    );
}
