import { DownloadIcon, PlusIcon } from '@radix-ui/react-icons';

import { VillagesTable } from './VillagesTable';
import { Button } from '@/components/layout/Button';
import { Flex, FlexItem } from '@/components/layout/Flex';
import { Title } from '@/components/layout/Title';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs';

export default function AdminManageVillagesPage() {
    return (
        <>
            <Breadcrumbs breadcrumbs={[{ label: 'Gérer', href: '/admin/manage' }, { label: 'Villages-mondes' }]} />
            <Flex isFullWidth alignItems="center" justifyContent="flex-start" flex-direction="row" gap="md" marginY="md">
                <FlexItem flexGrow={1} flexShrink={0} flexBasis="0">
                    <Title>
                        <span>Villages-mondes</span>
                    </Title>
                </FlexItem>
                <Button variant="contained" color="primary" leftIcon={<DownloadIcon />} label="Importer les villages-mondes" />
                <Button
                    as="a"
                    href="/admin/manage/villages/new"
                    variant="contained"
                    color="secondary"
                    leftIcon={<PlusIcon />}
                    label="Nouveau village-monde"
                />
            </Flex>
            <VillagesTable />
        </>
    );
}
