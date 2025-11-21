import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { Title } from '@frontend/components/ui/Title';

import { Editor } from './Editor';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { SectionContainer } from '@frontend/components/ui/SectionContainer';

interface ServerPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    params: Promise<{ [key: string]: string }>;
}

export default async function AdminCreateH5pNewPage({ params }: ServerPageProps) {
    const contentId = (await params).contentId;
    const isNew = contentId === 'new';

    return (
        <>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Créer', href: '/admin' },
                    { label: 'Activités H5P', href: '/admin/create/h5p' },
                    {
                        label: isNew ? 'Nouvelle activité H5P' : "Modifier l'activité H5P",
                    },
                ]}
            />
            <PageContainer title={isNew ? 'Nouvelle activité H5P' : "Modifier l'activité H5P"}>
                <SectionContainer>
                    <Editor contentId={contentId} />
                </SectionContainer>
            </PageContainer>
        </>
    );
}

