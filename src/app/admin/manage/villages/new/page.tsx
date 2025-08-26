import { NewVillageForm } from './NewVillageForm';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs';
import { Title } from '@/components/ui/Title';

export default async function AdminManageVillageNewPage() {
    return (
        <>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Gérer', href: '/admin/manage' },
                    { label: 'Villages-mondes', href: '/admin/manage/villages' },
                    {
                        label: 'Nouveau village-monde',
                    },
                ]}
            />
            <Title marginY="md">Ajouter un village-monde</Title>
            <NewVillageForm />
        </>
    );
}
