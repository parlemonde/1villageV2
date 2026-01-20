'use client';

import { CUSTOM_THEME_VALUE, useEnigmeSubthemes, type ThemeName } from '@app/(1village)/(activities)/creer-une-enigme/enigme-constants';
import { ContentEditor } from '@frontend/components/content/ContentEditor';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { useContext } from 'react';

export default function CreerUneEnigmeStep2() {
    const { activity, setActivity, getOrCreateDraft } = useContext(ActivityContext);
    const DEFAULT_SUBTHEMES = useEnigmeSubthemes();

    if (!activity || activity.type !== 'enigme') {
        return null;
    }

    const defaultTheme: ThemeName = activity.data?.defaultTheme || CUSTOM_THEME_VALUE;
    const customTheme: string = activity.data?.customTheme || '';
    const step1Theme = DEFAULT_SUBTHEMES[defaultTheme]?.find((subtheme) => subtheme.name === customTheme)?.tname || customTheme;

    const isFirstStepDone = !!(activity.data?.customTheme || activity.data?.defaultTheme);

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: step1Theme || 'Énigme', href: '/creer-une-enigme/1', status: isFirstStepDone ? 'success' : 'warning' },
                    { label: "Créer l'énigme", href: '/creer-une-enigme/2' },
                    { label: 'Réponse', href: '/creer-une-enigme/3' },
                    { label: 'Pré-visualiser', href: '/creer-une-enigme/4' },
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
                    getActivityId={getOrCreateDraft}
                />
                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                    <Button as="a" href="/creer-une-enigme/3" color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />}></Button>
                </div>
            </div>
        </PageContainer>
    );
}
