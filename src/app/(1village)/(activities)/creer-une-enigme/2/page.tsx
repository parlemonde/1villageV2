'use client';

import { ContentEditor } from '@frontend/components/content/ContentEditor';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { useContext } from 'react';

export default function CreerUneEnigmeStep2() {
    const { activity, setActivity } = useContext(ActivityContext);

    if (!activity || activity.type !== 'enigme') {
        return null;
    }

    const puzzle = activity.data?.defaultTheme || activity.data?.customTheme;
    const isFirstStepDone = !!puzzle;

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: puzzle || 'Énigme', href: '/creer-une-enigme/1', status: isFirstStepDone ? 'success' : 'warning' },
                    { label: "Créer l'énigme", href: '/creer-une-enigme/2' },
                    { label: 'Pré-visualiser', href: '/creer-une-enigme/3' },
                ]}
                activeStep={2}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Créer votre énigme :
            </Title>
            <div style={{ marginTop: '16px' }}>
                <ContentEditor
                    content={activity.data?.content}
                    setContent={(content) => setActivity({ ...activity, data: { ...activity.data, content } })}
                    activityId={activity.id}
                />
                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                    <Button as="a" href="/creer-une-enigme/3" color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />}></Button>
                </div>
            </div>
        </PageContainer>
    );
}
