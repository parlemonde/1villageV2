import { ChevronLeftIcon, PlusIcon } from '@radix-ui/react-icons';

import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Title } from '@/components/ui/Title';

export default function AdminManageUsersPage() {
    return (
        <>
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
                <Button variant="contained" color="secondary" leftIcon={<PlusIcon />} label="Nouvel utilisateur" disabled />
            </div>
            <Button
                as="a"
                color="primary"
                variant="outlined"
                label="Retour"
                href="/admin/manage"
                marginTop="lg"
                leftIcon={<ChevronLeftIcon width={18} height={18} />}
            />
        </>
    );
}
