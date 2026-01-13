import { getArchiveFolders } from '@app/api/archives/[...filepath]/route';
import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@frontend/components/ui/Button';
import { Link } from '@frontend/components/ui/Link';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { ChevronLeftIcon } from '@radix-ui/react-icons';

import styles from './archives.module.css';

export default async function AdminManageArchivePage() {
    const archives = await getArchiveFolders();
    return (
        <PageContainer>
            <Breadcrumbs breadcrumbs={[{ label: 'Gérer', href: '/admin/manage' }, { label: 'Archives' }]} />
            <Title marginY="md">Consulter les archives</Title>
            <p style={{ marginBottom: '24px' }}>
                Voilà la liste des archives existantes. Si tu souhaites effectuer une nouvelle archive d&apos;1Village, adresse toi au pôle tech.
            </p>
            <ul className={styles.listArchives}>
                {archives.map((archive, index) => (
                    <li key={index}>
                        <Link href={`/api/archives/${archive}/`} passHref>
                            {archive}
                        </Link>
                    </li>
                ))}
            </ul>
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
