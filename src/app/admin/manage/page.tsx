import { AdminLink } from '@frontend/components/AdminLink/AdminLink';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { SectionContainer } from '@frontend/components/ui/SectionContainer';

export default function AdminManagePage() {
    return (
        <PageContainer title="Gérer">
            <SectionContainer>
                <p style={{ marginBottom: '16px' }}>
                    C&apos;est dans cet espace, que les administrateurs et administratrices du site vont pouvoir gérer les droits d&apos;accès, la
                    composition des villages-mondes et accéder à la liste complète des utilisateurs.
                </p>
                <AdminLink href="/admin/manage/villages" label="Les villages-mondes" />
                <AdminLink href="/admin/manage/users" label="Les utilisateurs" />
                <AdminLink href="/admin/manage/phases" label="Paraméter les phases" />
            </SectionContainer>
        </PageContainer>
    );
}
