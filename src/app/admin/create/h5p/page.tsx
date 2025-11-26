import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { SectionContainer } from '@frontend/components/ui/SectionContainer/SectionContainer';
import { ChevronLeftIcon, PlusIcon } from '@radix-ui/react-icons';
import { db } from '@server/database';
import { medias } from '@server/database/schemas/medias';
import { eq } from 'drizzle-orm';

import { H5pTable } from './h5pTable';

export default async function AdminCreateH5pPage() {
    const h5pMedias = await db.select().from(medias).where(eq(medias.type, 'h5p'));
    return (
        <>
            <Breadcrumbs breadcrumbs={[{ label: 'Créer', href: '/admin' }, { label: 'Activités H5P' }]} />
            <PageContainer
                title="Activités H5P"
                actionButtons={[
                    <Button
                        key="add-activity-button"
                        as="a"
                        href="/admin/create/h5p/new"
                        variant="contained"
                        color="secondary"
                        leftIcon={<PlusIcon />}
                        label="Ajouter une activité H5P"
                    />,
                ]}
            >
                <SectionContainer>
                    <div
                        style={{
                            display: 'flex',
                            width: '100%',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            flexDirection: 'row',
                            gap: '16px',
                            margin: '16px 0',
                        }}
                    ></div>
                    <H5pTable h5pMedias={h5pMedias} />
                </SectionContainer>

                <Button
                    as="a"
                    color="primary"
                    variant="outlined"
                    label="Retour"
                    href="/admin"
                    leftIcon={<ChevronLeftIcon width={18} height={18} />}
                />
            </PageContainer>
        </>
    );
}
