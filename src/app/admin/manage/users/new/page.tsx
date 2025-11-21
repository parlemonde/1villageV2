import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { SectionContainer } from '@frontend/components/ui/SectionContainer/SectionContainer';

import { UserForm } from './UserForm';

export default function AdminNewUserPage() {
    return (
        <>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Gérer', href: '/admin/manage' },
                    { label: 'Utilisateurs', href: '/admin/manage/users' },
                    {
                        label: 'Nouvel utilisateur',
                    },
                ]}
            />

            <PageContainer title="Ajouter un utilisateur">
                <SectionContainer>
                    <UserForm isNew />
                </SectionContainer>
            </PageContainer>
        </>
    );
}
