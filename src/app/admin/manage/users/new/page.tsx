import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';

import { UserForm } from './UserForm';

export default function AdminNewUserPage() {
    return (
        <PageContainer>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Gérer', href: '/admin/manage' },
                    { label: 'Utilisateurs', href: '/admin/manage/users' },
                    {
                        label: 'Nouvel utilisateur',
                    },
                ]}
            />
            <Title marginY="md">Ajouter un utilisateur</Title>
            <UserForm isNew />
        </PageContainer>
    );
}
