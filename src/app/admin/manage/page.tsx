import { AdminLink } from '@frontend/components/AdminLink/AdminLink';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';

export default function AdminManagePage() {
    return (
        <PageContainer title="Gérer">
            <p style={{ margin: '16px 0' }}>
                C&apos;est dans cet espace, que les administrateurs et administratrices du site vont pouvoir gérer les droits d&apos;accès, la
                composition des villages-mondes et accéder à la liste complète des utilisateurs.
            </p>
            <AdminLink href="/admin/manage/villages" label="Les villages-mondes" />
            <AdminLink href="/admin/manage/users" label="Les utilisateurs" />
            <AdminLink href="/admin/manage/classrooms" label="Les classes" />
            <AdminLink href="/admin/manage/phases" label="Paraméter les phases" />
            <AdminLink href="/admin/manage/activities" label="Paraméter les activités" />
            <AdminLink href="/admin/manage/translations" label="Gestion des traductions" />
            <AdminLink href="/admin/manage/pelico" label="Présentation de Pélico" />
        </PageContainer>
    );
}
