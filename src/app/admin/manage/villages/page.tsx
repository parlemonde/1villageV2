import { DownloadIcon, PlusIcon } from '@radix-ui/react-icons';

import { VillagesTable } from './VillagesTable';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Title } from '@/components/ui/Title';

export default function AdminManageVillagesPage() {
    return (
        <>
            <Breadcrumbs breadcrumbs={[{ label: 'Gérer', href: '/admin/manage' }, { label: 'Villages-mondes' }]} />
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    flexDirection: 'row',
                    gap: '16px',
                    margin: '16px 0',
                }}
            >
                <Title style={{ flex: '1 1 0' }}>Villages-mondes</Title>
                <Button variant="contained" color="primary" leftIcon={<DownloadIcon />} label="Importer les villages-mondes" />
                <Button
                    as="a"
                    href="/admin/manage/villages/new"
                    variant="contained"
                    color="secondary"
                    leftIcon={<PlusIcon />}
                    label="Nouveau village-monde"
                />
            </div>
            <VillagesTable />
        </>
    );
}
