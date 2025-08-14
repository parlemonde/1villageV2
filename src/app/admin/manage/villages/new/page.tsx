import { Title } from '@/components/ui/Title';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs';

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
            <Title marginY="md">
                <span>Nouveau village-monde</span>
            </Title>
        </>
    );
}
