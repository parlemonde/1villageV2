import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { SectionContainer } from '@frontend/components/ui/SectionContainer/SectionContainer';
import { ChevronLeftIcon, PlusIcon } from '@radix-ui/react-icons';

import { ImportVillagesButton } from './ImportVillagesButton';
import { VillagesTable } from './VillagesTable';

export default function AdminManageVillagesPage() {
    return (
        <>
            <Breadcrumbs breadcrumbs={[{ label: 'Gérer', href: '/admin/manage' }, { label: 'Villages-mondes' }]} />

            <PageContainer
                title="Villages-mondes"
                actionButtons={[
                    <ImportVillagesButton key="import-villages-button" />,
                    <Button
                        key="add-village-button"
                        as="a"
                        href="/admin/manage/villages/new"
                        variant="contained"
                        color="secondary"
                        leftIcon={<PlusIcon />}
                        label="Nouveau village-monde"
                    />,
                ]}
            >
                <SectionContainer>
                    <VillagesTable />
                </SectionContainer>
                <Button
                    as="a"
                    color="primary"
                    variant="outlined"
                    label="Retour"
                    href="/admin/manage"
                    leftIcon={<ChevronLeftIcon width={18} height={18} />}
                />
            </PageContainer>
        </>
    );
}
