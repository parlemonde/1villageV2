'use client';

import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { useContext } from 'react';

export default function CreerLaMascotteStep5() {
    const { activity } = useContext(ActivityContext);

    if (!activity || activity.type !== 'mascotte') {
        return null;
    }

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: 'Votre classe', href: '/creer-la-mascotte/1' },
                    { label: activity.data?.mascot.name || 'Votre mascotte', href: '/creer-la-mascotte/2' },
                    { label: 'Langues et monnaies', href: '/creer-la-mascotte/3' },
                    { label: 'Le web de Pélico', href: '/creer-la-mascotte/4' },
                    { label: 'Pré-visualiser', href: '/creer-la-mascotte/5' },
                ]}
                activeStep={5}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Pré-visualisez votre mascotte et publiez-la
            </Title>
            <p>Relisez votre publication une dernière fois avant de la publier !</p>
        </PageContainer>
    );
}
