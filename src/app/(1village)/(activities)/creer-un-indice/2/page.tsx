'use client';

import { ContentEditor } from '@frontend/components/content/ContentEditor';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import React, { useContext } from 'react';

export default function CreerUnIndiceStep2() {
    const { activity, setActivity, getOrCreateDraft } = useContext(ActivityContext);

    if (!activity || activity.type !== 'indice') {
        return null;
    }

    const hint = activity.data?.defaultHint || activity.data?.customHint;
    const isFirstStepDone = !!hint;

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: hint || 'Indice', href: '/creer-un-indice/1', status: isFirstStepDone ? 'success' : 'warning' },
                    { label: "Créer l'indice", href: '/creer-un-indice/2' },
                    { label: 'Pré-visualiser', href: '/creer-un-indice/3' },
                ]}
                activeStep={2}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Créer votre indice :
            </Title>
            <div style={{ marginTop: '16px' }}>
                <ContentEditor
                    content={activity.data?.content}
                    setContent={(content) =>
                        setActivity({
                            data: {
                                content,
                                defaultHint: activity.data?.defaultHint ?? '',
                                customHint: activity.data?.customHint ?? '',
                            },
                        })
                    }
                    activityId={activity.id}
                    getActivityId={getOrCreateDraft}
                />
                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                    <Button as="a" href="/creer-un-indice/3" color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />}></Button>
                </div>
            </div>
        </PageContainer>
    );
}
