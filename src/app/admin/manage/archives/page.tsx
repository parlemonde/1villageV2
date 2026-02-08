import { getArchiveFolders } from '@app/api/archives/[...filepath]/route';
import { AdminLink } from '@frontend/components/AdminLink/AdminLink';
import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { ChevronLeftIcon } from '@radix-ui/react-icons';

export default async function AdminManageArchivePage() {
    const archives = await getArchiveFolders();
    return (
        <PageContainer>
            <Breadcrumbs breadcrumbs={[{ label: 'Gérer', href: '/admin/manage' }, { label: 'Archives' }]} />
            <Title marginY="md">Consulter les archives</Title>
            <p style={{ marginBottom: '24px' }}>
                Voilà la liste des archives existantes. Si tu souhaites effectuer une nouvelle archive d&apos;1Village, adresse toi au pôle tech.
            </p>
            {archives.map((archive) => (
                <AdminLink key={archive} href={`/api/archives/${archive}/`} label={archive} />
            ))}
            <Button
                as="a"
                color="primary"
                variant="outlined"
                label="Retour"
                href="/admin/manage"
                marginTop="lg"
                leftIcon={<ChevronLeftIcon width={18} height={18} />}
            />
        </PageContainer>
    );
}
