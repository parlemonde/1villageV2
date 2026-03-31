import { ContentViewer } from '@frontend/components/content/ContentViewer/ContentViewer';
import { PageContainer } from '@frontend/components/ui/PageContainer/PageContainer';
import { Title } from '@frontend/components/ui/Title';
import { getPelicoPresentation } from '@server/entities/activities/get-pelico-presentation';
import { getExtracted } from 'next-intl/server';

import styles from './page.module.css';

export default async function PelicoPage() {
    const t = await getExtracted('app.(1village).pelico');
    const presentation = await getPelicoPresentation();
    const presentationData = presentation?.type === 'presentation-pelico' ? presentation.data : null;

    return (
        <div className={styles.pageLayout}>
            <div className={styles.content}>
                <PageContainer>
                    <Title marginY="md">{t("Pélico, la mascotte d'1Village, se présente")}</Title>
                    {presentationData?.content && <ContentViewer content={presentationData.content} activityId={presentation!.id} />}
                </PageContainer>
            </div>
        </div>
    );
}
