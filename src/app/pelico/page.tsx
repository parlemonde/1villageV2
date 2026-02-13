import { ContentViewer } from '@frontend/components/content/ContentViewer/ContentViewer';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { getPelicoPresentation } from '@server-actions/activities/get-pelico-presentation';

import { LastActivities } from './LastActivities';
import styles from './page.module.css';

export default async function PelicoPage() {
    const presentation = await getPelicoPresentation();
    const presentationData = presentation?.type === 'presentation-pelico' ? presentation.data : null;

    return (
        <div className={styles.pageLayout}>
            <div className={styles.content}>
                <PageContainer>
                    <Title marginY="md">Pélico, la mascotte d&apos;1Village, se présente</Title>
                    {presentationData?.content && <ContentViewer content={presentationData.content} activityId={presentation!.id} />}
                </PageContainer>
            </div>
            <aside className={styles.sidebar}>
                <LastActivities />
            </aside>
        </div>
    );
}
