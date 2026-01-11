import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { ChevronLeftIcon, PlusIcon } from '@radix-ui/react-icons';

import { UsersTable } from './UsersTable';

export default function AdminManageUsersPage() {
    return (
        <PageContainer>
            <Breadcrumbs breadcrumbs={[{ label: 'Gérer', href: '/admin/manage' }, { label: 'Utilisateurs' }]} />
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    flexDirection: 'row',
                    gap: '16px',
                    margin: '16px 0',
                }}
            >
                <Title style={{ flex: '1 1 0' }}>Utilisateurs</Title>
                <Button
                    as="a"
                    href="/admin/manage/users/new"
                    variant="contained"
                    color="secondary"
                    leftIcon={<PlusIcon />}
                    label="Ajouter un utilisateur"
                    hideLabelOnMobile
                />
            </div>
            <UsersTable />
            <Button
                as="a"
                color="primary"
                variant="outlined"
                label="Retour"
                href="/admin/manage"
                marginTop="lg"
                leftIcon={<ChevronLeftIcon width={18} height={18} />}
            />
        </PageContainer>
    );
}
