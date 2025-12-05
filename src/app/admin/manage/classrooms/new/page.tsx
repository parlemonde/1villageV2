import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Title } from '@frontend/components/ui/Title';

import { ClassroomForm } from './ClassroomForm';

export default function AdminNewClassroomPage() {
    return (
        <PageContainer>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Gérer', href: '/admin/manage' },
                    { label: 'Classes', href: '/admin/manage/classrooms' },
                    {
                        label: 'Nouvelle classe',
                    },
                ]}
            />
            <Title marginY="md">Ajouter une classe</Title>
            <ClassroomForm />
        </PageContainer>
    );
}
