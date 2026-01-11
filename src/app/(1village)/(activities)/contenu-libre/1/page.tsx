'use client';

import { BackButton } from '@frontend/components/activities/BackButton/BackButton';
import { ContentEditor } from '@frontend/components/content/ContentEditor';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { useContext } from 'react';

export default function FreeContentStep1() {
    const { activity, setActivity, getOrCreateDraft } = useContext(ActivityContext);
    if (!activity || activity.type !== 'libre') {
        return null;
    }

    return (
        <PageContainer>
            <BackButton href="/contenu-libre" label="Retour" />
            <Steps
                steps={[
                    { label: 'Contenu', href: '/contenu-libre/1' },
                    { label: 'Forme', href: '/contenu-libre/2' },
                    { label: 'Pré-visualiser', href: '/contenu-libre/3' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Écrivez le contenu de votre publication
            </Title>
            <p>
                Utilisez l&apos;éditeur de bloc pour définir le contenu de votre publication. Dans l&apos;étape 2 vous pourrez définir l&apos;aspect
                de la carte résumée de votre publication.
            </p>
            <div style={{ marginTop: '16px' }}>
                <ContentEditor
                    content={activity.data?.content}
                    setContent={(content) => setActivity({ ...activity, data: { ...activity.data, content } })}
                    activityId={activity.id}
                    getActivityId={getOrCreateDraft}
                />
                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                    <Button as="a" href="/contenu-libre/2" color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />}></Button>
                </div>
            </div>
        </PageContainer>
    );
}
