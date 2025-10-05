import { AdminLink } from '@frontend/components/AdminLink/AdminLink';
import { Title } from '@frontend/components/ui/Title';

export default function AdminHomePage() {
    return (
        <>
            <Title>Créer</Title>
            <p style={{ margin: '16px 0' }}>
                C&apos;est dans cet espace, que les administrateurs et administratrices du site vont pouvoir gérer les droits d’accès, la composition
                des villages-mondes et accéder à la liste complète des utilisateurs.
            </p>
            <AdminLink href="/admin/create/h5p" label="Créer une activité H5P" />
        </>
    );
}
