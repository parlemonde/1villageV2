import { Breadcrumbs } from '@frontend/components/ui/Breadcrumbs/Breadcrumbs';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';

import { Editor } from './Editor';

interface ServerPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    params: Promise<{ [key: string]: string }>;
}

export default async function AdminCreateH5pNewPage({ params }: ServerPageProps) {
    const contentId = (await params).contentId;
    const isNew = contentId === 'new';

    return (
        <PageContainer>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Créer', href: '/admin' },
                    { label: 'Activités H5P', href: '/admin/create/h5p' },
                    {
                        label: isNew ? 'Nouvelle activité H5P' : "Modifier l'activité H5P",
                    },
                ]}
            />
            <Title marginY="md">{isNew ? 'Nouvelle activité H5P' : "Modifier l'activité H5P"}</Title>
            <Editor contentId={contentId} />
        </PageContainer>
    );
}
