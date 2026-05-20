import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { useExtracted } from 'next-intl';

import { CrossVisibilityTable } from './CrossVisibilityTable';

export default function AdminManageMysteryCountryPage() {
    const t = useExtracted('app.admin.manage.mystery-country');
    return (
        <PageContainer>
            <Breadcrumbs breadcrumbs={[{ label: t('Gérer'), href: '/admin/manage' }, { label: t('Pays mystère') }]} />
            <Title marginY="md">{t('Découverte du pays mystère')}</Title>
            <CrossVisibilityTable />
            <Button
                as="a"
                color="primary"
                variant="outlined"
                label={t('Retour')}
                href="/admin/manage"
                marginTop="lg"
                leftIcon={<ChevronLeftIcon width={18} height={18} />}
            />
        </PageContainer>
    );
}
