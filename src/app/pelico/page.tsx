import { ContentViewer } from '@frontend/components/content/ContentViewer/ContentViewer';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { getPelicoPresentation } from '@server-actions/activities/get-pelico-presentation';

export default async function PelicoPage() {
    const presentation = await getPelicoPresentation();

    return (
        <PageContainer>
            <Title marginY="md">Pélico, la mascotte d&apos;1Village, se présente</Title>
            {presentation?.data && <ContentViewer content={presentation.data.content} activityId={presentation.id} />}
        </PageContainer>
    );
}
