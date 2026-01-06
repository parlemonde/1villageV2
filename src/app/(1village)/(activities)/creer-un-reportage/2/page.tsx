'use client';

import { ContentEditor } from '@frontend/components/content/ContentEditor';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { useContext } from 'react';

export default function CreerUnReportageStep2() {
    const { activity, setActivity } = useContext(ActivityContext);

    if (!activity || activity.type !== 'reportage') {
        return null;
    }

    const report = activity.data?.defaultReport || activity.data?.customReport;
    const isFirstStepDone = !!report;

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: report || 'Reportage', href: '/creer-un-reportage/1', status: isFirstStepDone ? 'success' : 'warning' },
                    { label: 'Créer le reportage', href: '/creer-un-reportage/2' },
                    { label: 'Pré-visualiser', href: '/creer-un-reportage/3' },
                ]}
                activeStep={2}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Créer votre reportage :
            </Title>
            <div style={{ marginTop: '16px' }}>
                <ContentEditor
                    content={activity.data?.content}
                    setContent={(content) => setActivity({ ...activity, data: { ...activity.data, content } })}
                    activityId={activity.id}
                />
                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                    <Button as="a" href="/creer-un-reportage/3" color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />} />
                </div>
            </div>
        </PageContainer>
    );
}
