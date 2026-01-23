'use client';

import { ContentEditor } from '@frontend/components/content/ContentEditor';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

export default function CreerUnReportageStep2() {
    const t = useExtracted('app.(1village).(activities).creer-un-reportage.2');
    const tCommon = useExtracted('common');

    const { activity, setActivity, getOrCreateDraft } = useContext(ActivityContext);

    if (!activity || activity.type !== 'reportage') {
        return null;
    }

    const report = activity.data?.defaultReport || activity.data?.customReport;
    const isFirstStepDone = !!report;

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: report || t('Reportage'), href: '/creer-un-reportage/1', status: isFirstStepDone ? 'success' : 'warning' },
                    { label: t('Créer le reportage'), href: '/creer-un-reportage/2' },
                    { label: tCommon('Pré-visualiser'), href: '/creer-un-reportage/3' },
                ]}
                activeStep={2}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Créer votre reportage')} :
            </Title>
            <div style={{ marginTop: '16px' }}>
                <ContentEditor
                    getActivityId={getOrCreateDraft}
                    content={activity.data?.content}
                    setContent={(content) => setActivity({ ...activity, data: { ...activity.data, content } })}
                    activityId={activity.id}
                />
                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                    <Button as="a" href="/creer-un-reportage/3" color="primary" label={tCommon('Étape suivante')} rightIcon={<ChevronRightIcon />} />
                </div>
            </div>
        </PageContainer>
    );
}
