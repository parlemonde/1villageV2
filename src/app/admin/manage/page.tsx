import { AdminLink } from '@frontend/components/AdminLink/AdminLink';
import { Title } from '@frontend/components/ui/Title';

export default function AdminManagePage() {
    return (
        <>
            <Title>Gérer</Title>
            <p style={{ margin: '16px 0' }}>
                C&apos;est dans cet espace, que les administrateurs et administratrices du site vont pouvoir gérer les droits d&apos;accès, la
                composition des villages-mondes et accéder à la liste complète des utilisateurs.
            </p>
            <AdminLink href="/admin/manage/villages" label="Les villages-mondes" />
            <AdminLink href="/admin/manage/users" label="Les utilisateurs" />
        </>
    );
}
