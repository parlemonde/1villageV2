import { AdminLink } from '@frontend/components/AdminLink/AdminLink';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';

export default function AdminHomePage() {
    return (
        <PageContainer title="Créer">
            <p style={{ marginBottom: '16px' }}>
                C&apos;est dans cet espace, que les administrateurs et administratrices du site vont pouvoir gérer les droits d’accès, la composition
                des villages-mondes et accéder à la liste complète des utilisateurs.
            </p>
            <AdminLink href="/admin/create/h5p" label="Créer une activité H5P" />
        </PageContainer>
    );
}
