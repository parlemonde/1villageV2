'use client';

import { ActivityStepPreview } from '@frontend/components/activities/ActivityStepPreview';
import { ContentViewer } from '@frontend/components/content/ContentViewer';
import { Button } from '@frontend/components/ui/Button';
import { Loader } from '@frontend/components/ui/Loader';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';

export default function CreerUnIndiceStep3() {
    const router = useRouter();
    const { activity, onPublishActivity, onUpdateActivity } = useContext(ActivityContext);
    const [isSubmiting, setIsSubmiting] = useState(false);

    if (!activity || activity.type !== 'reportage') {
        return null;
    }

    const report = activity.data?.defaultReport || activity.data?.customReport;
    const isFirstStepDone = !!report;
    const isSecondStepDone = (activity.data?.content || []).length > 0;
    const isValid = isFirstStepDone && isSecondStepDone;

    const onSubmit = async () => {
        setIsSubmiting(true);
        try {
            if (activity.publishDate) {
                await onUpdateActivity();
            } else {
                await onPublishActivity();
            }
            router.push('/creer-un-reportage/success');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmiting(false);
        }
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: report || 'Reportage', href: '/creer-un-reportage/2', status: isFirstStepDone ? 'success' : 'warning' },
                    { label: 'Créer le reportage', href: '/creer-un-reportage/2', status: isSecondStepDone ? 'success' : 'warning' },
                    { label: 'Pré-visualiser', href: '/creer-un-reportage/3' },
                ]}
                activeStep={3}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Pré-visualisez votre reportage et publiez-le :
            </Title>
            <p>Relisez votre publication une dernière fois avant de la publier !</p>
            <ActivityStepPreview
                stepName="Reportage"
                href="/creer-un-reportage/1"
                status={isFirstStepDone ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                {report}
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName="Contenu"
                href="/creer-un-reportage/2"
                status={isSecondStepDone ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <ContentViewer content={activity.data?.content} activityId={activity.id} />
            </ActivityStepPreview>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '32px 0' }}>
                <Button as="a" href="/creer-un-reportage/2" color="primary" label="Étape précédente" leftIcon={<ChevronLeftIcon />} />
                <Button
                    color="primary"
                    variant="contained"
                    label={activity.publishDate ? 'Modifier' : 'Publier'}
                    disabled={!isValid}
                    onClick={onSubmit}
                />
            </div>
            {isSubmiting && <Loader isLoading={isSubmiting} />}
        </PageContainer>
    );
}
