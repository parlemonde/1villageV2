import { AdminLink } from '@frontend/components/AdminLink/AdminLink';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { useExtracted } from 'next-intl';

export default function AdminManagePage() {
    const t = useExtracted('app.admin.manage');
    return (
        <PageContainer title="Gérer">
            <p style={{ margin: '16px 0' }}>
                {t(
                    "C'est dans cet espace, que les administrateurs et administratrices du site vont pouvoir gérer les droits d'accès, la composition des villages-mondes et accéder à la liste complète des utilisateurs.",
                )}
            </p>
            <AdminLink href="/admin/manage/villages" label={t('Les villages-mondes')} />
            <AdminLink href="/admin/manage/users" label={t('Les utilisateurs')} />
            <AdminLink href="/admin/manage/classrooms" label={t('Les classes')} />
            <AdminLink href="/admin/manage/phases" label={t('Paraméter les phases')} />
            <AdminLink href="/admin/manage/activities" label={t('Paraméter les activités')} />
            <AdminLink href="/admin/manage/translations" label={t('Gestion des traductions')} />
            <AdminLink href="/admin/manage/archives" label={t('Archives')} />
        </PageContainer>
    );
}
