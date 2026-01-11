import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { ChevronLeftIcon, PlusIcon } from '@radix-ui/react-icons';

import { ClassroomsTable } from './ClassroomsTable';

export default function AdminManageClassroomsPage() {
    return (
        <PageContainer>
            <Breadcrumbs breadcrumbs={[{ label: 'Gérer', href: '/admin/manage' }, { label: 'Classes' }]} />
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
                <Title style={{ flex: '1 1 0' }}>Classes</Title>
                <Button
                    as="a"
                    href="/admin/manage/classrooms/new"
                    variant="contained"
                    color="secondary"
                    leftIcon={<PlusIcon />}
                    label="Ajouter une classe"
                    hideLabelOnMobile
                />
            </div>
            <ClassroomsTable />
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
