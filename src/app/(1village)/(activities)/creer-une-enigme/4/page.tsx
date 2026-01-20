'use client';

import { CUSTOM_THEME_VALUE, useEnigmeSubthemes, type ThemeName } from '@app/(1village)/(activities)/creer-une-enigme/enigme-constants';
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

export default function CreerUneEnigmeStep4() {
    const router = useRouter();
    const { activity, onPublishActivity, onUpdateActivity } = useContext(ActivityContext);
    const DEFAULT_SUBTHEMES = useEnigmeSubthemes();
    const [isSubmiting, setIsSubmiting] = useState(false);

    if (!activity || activity.type !== 'enigme') {
        return null;
    }

    const defaultTheme: ThemeName = activity.data?.defaultTheme || CUSTOM_THEME_VALUE;
    const customTheme: string = activity.data?.customTheme || '';
    const step1Theme = DEFAULT_SUBTHEMES[defaultTheme]?.find((subtheme) => subtheme.name === customTheme)?.tname || customTheme;
    const isFirstStepDone = !!(activity.data?.customTheme || activity.data?.defaultTheme);
    const isSecondStepDone = (activity.data?.content || []).length > 0;
    const isThirdStepDone = (activity.data?.answer || []).length > 0;
    const isValid = isFirstStepDone && isSecondStepDone && isThirdStepDone;

    const onSubmit = async () => {
        setIsSubmiting(true);
        try {
            if (activity.publishDate) {
                await onUpdateActivity();
            } else {
                await onPublishActivity();
            }
            router.push('/creer-une-enigme/success');
        } catch (error) {
            // TODO: show error toast
            console.error(error);
        } finally {
            setIsSubmiting(false);
        }
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: step1Theme || 'Énigme', href: '/creer-une-enigme/1', status: isFirstStepDone ? 'success' : 'warning' },
                    { label: "Créer l'énigme", href: '/creer-une-enigme/2', status: isSecondStepDone ? 'success' : 'warning' },
                    { label: 'Réponse', href: '/creer-une-enigme/3', status: isThirdStepDone ? 'success' : 'warning' },
                    { label: 'Pré-visualiser', href: '/creer-une-enigme/4' },
                ]}
                activeStep={4}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Pré-visualisez votre énigme et publiez-la
            </Title>
            <p>Relisez votre publication une dernière fois avant de la publier !</p>
            <ActivityStepPreview
                stepName="Énigme"
                href="/creer-une-enigme/1"
                status={isFirstStepDone ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                {step1Theme}
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName="Contenu"
                href="/creer-une-enigme/2"
                status={isSecondStepDone ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <ContentViewer content={activity.data?.content} activityId={activity.id} />
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName="Réponse"
                href="/creer-une-enigme/3"
                status={isThirdStepDone ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <ContentViewer content={activity.data?.answer} activityId={activity.id} />
            </ActivityStepPreview>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '32px 0' }}>
                <Button
                    as="a"
                    href="/creer-une-enigme/3"
                    color="primary"
                    variant="outlined"
                    label="Étape précédente"
                    leftIcon={<ChevronLeftIcon />}
                />
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
