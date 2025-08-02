import { Title } from '@/components/layout/Title';

export default function AdminManagePage() {
    return (
        <>
            <Title>Gérer</Title>
            <p style={{ margin: '8px 0' }}>
                C&apos;est dans cet espace, que les administrateurs et administratrices du site vont pouvoir gérer les droits d&apos;accès, la
                composition des villages-mondes et accéder à la liste complète des utilisateurs.
            </p>
        </>
    );
}
