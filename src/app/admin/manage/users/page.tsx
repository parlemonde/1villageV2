import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@frontend/components/ui/Button';
import { ChevronLeftIcon, PlusIcon } from '@radix-ui/react-icons';
import { UsersTable } from './UsersTable';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { SectionContainer } from '@frontend/components/ui/SectionContainer/SectionContainer';

export default function AdminManageUsersPage() {
    return (
        <>
            <Breadcrumbs breadcrumbs={[{ label: 'Gérer', href: '/admin/manage' }, { label: 'Utilisateurs' }]} />
            <PageContainer
                title="Utilisateurs"
                actionButtons={[
                    <Button
                        key="add-user-button"
                        as="a"
                        href="/admin/manage/users/new"
                        variant="contained"
                        color="secondary"
                        leftIcon={<PlusIcon />}
                        label="Ajouter un utilisateur"
                    />,
                ]}
            >
                <SectionContainer>
                    <UsersTable />
                </SectionContainer>

                <Button
                    as="a"
                    color="primary"
                    variant="outlined"
                    label="Retour"
                    href="/admin/manage"
                    leftIcon={<ChevronLeftIcon width={18} height={18} />}
                />
            </PageContainer>
        </>
    );
}
