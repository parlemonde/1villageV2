import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { ChevronLeftIcon } from '@radix-ui/react-icons';

import { LanguagesTable } from './LanguagesTable';
import styles from './page.module.css';

export default function AdminManageTranslationsPage() {
    return (
        <PageContainer>
            <Breadcrumbs breadcrumbs={[{ label: 'Gérer', href: '/admin/manage' }, { label: 'Traductions' }]} />
            <div className={styles.headerContainer}>
                <Title className={styles.title}>Gestion des traductions</Title>
            </div>
            <LanguagesTable />
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
